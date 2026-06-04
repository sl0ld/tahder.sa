import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const fields = ['objectives', 'strategies', 'resources', 'closure', 'enrichment', 'assignment', 'hints', 'activities'];
const defaultGeminiModel = 'gemini-2.5-flash';
const defaultOpenAiModel = 'gpt-5-mini';

type ReferenceRow = {
  id: string;
  title: string;
  document_type: string;
  curriculum_year: string | null;
  subject: string | null;
  grade: string | null;
  term: string | null;
  version: string | null;
  storage_path: string;
};

function extractOutputText(response: { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> }) {
  return response.output
    ?.flatMap((item) => item.content ?? [])
    .filter((item) => item.type === 'output_text')
    .map((item) => item.text ?? '')
    .join('') ?? '';
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const publishableKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('TAHDER_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authorization = request.headers.get('Authorization') ?? '';
    const userClient = createClient(supabaseUrl, publishableKey, {
      global: { headers: { Authorization: authorization } },
    });
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: authData, error: authError } = await userClient.auth.getUser();

    if (authError || !authData.user) {
      return json({ error: 'يجب تسجيل الدخول أولاً.' }, 401);
    }

    const userId = authData.user.id;
    const { data: isActive } = await adminClient.rpc('has_active_subscription', { target_user_id: userId });

    if (!isActive) {
      return json({ error: 'يتطلب استخدام التوليد اشتراكاً فعالاً.' }, 403);
    }

    const lesson = await request.json();
    const references = await findReferences(adminClient, lesson);
    const provider = Deno.env.get('AI_PROVIDER') ?? 'gemini';
    const model = provider === 'openai'
      ? Deno.env.get('OPENAI_MODEL') ?? defaultOpenAiModel
      : Deno.env.get('GEMINI_MODEL') ?? defaultGeminiModel;
    const { data: log, error: logError } = await adminClient
      .from('generation_logs')
      .insert({
        user_id: userId,
        lesson_context: { ...lesson, references: references.map((reference) => reference.id) },
        provider,
        model,
      })
      .select('id')
      .single();

    if (logError) console.error(logError);

    const generation = provider === 'openai'
      ? await generateWithOpenAi(model, lesson, references)
      : await generateWithGemini(model, lesson, references);
    const content = generation.content;
    const { data: preparation, error: preparationError } = await userClient
      .from('preparations')
      .insert({
        user_id: userId,
        lesson_title: lesson.lesson_title ?? 'درس بدون عنوان',
        subject: lesson.subject,
        grade: lesson.grade,
        term: lesson.term,
        content,
        status: 'ready',
        source: 'ai',
      })
      .select('id, content')
      .single();

    if (preparationError) throw preparationError;

    if (log?.id) {
      await adminClient
        .from('generation_logs')
        .update({
          preparation_id: preparation.id,
          status: 'completed',
          prompt_tokens: generation.promptTokens,
          output_tokens: generation.outputTokens,
          completed_at: new Date().toISOString(),
        })
        .eq('id', log.id);
    }

    return json(preparation);
  } catch (error) {
    console.error(error);
    return json({ error: getErrorMessage(error) }, 500);
  }
});

async function generateWithGemini(model: string, lesson: Record<string, unknown>, references: ReferenceRow[]) {
  const geminiKey = Deno.env.get('GEMINI_API_KEY');
  if (!geminiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: getArabicSystemPrompt() }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: JSON.stringify(buildGenerationPayload(lesson, references)) }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: getGeminiPreparationSchema(),
          temperature: 0.35,
        },
      }),
    },
  );
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message ?? 'Gemini generation failed.');
  }

  const text = result.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text ?? '')
    .join('') ?? '';

  return {
    content: parsePreparationJson(text),
    promptTokens: result.usageMetadata?.promptTokenCount,
    outputTokens: result.usageMetadata?.candidatesTokenCount,
  };
}

async function generateWithOpenAi(model: string, lesson: Record<string, unknown>, references: ReferenceRow[]) {
  const openAiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAiKey) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      instructions: getArabicSystemPrompt(),
      input: JSON.stringify(buildGenerationPayload(lesson, references)),
      text: {
        format: {
          type: 'json_schema',
          name: 'lesson_preparation',
          strict: true,
          schema: getOpenAiPreparationSchema(),
        },
      },
    }),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message ?? 'OpenAI generation failed.');
  }

  return {
    content: parsePreparationJson(extractOutputText(result)),
    promptTokens: result.usage?.input_tokens,
    outputTokens: result.usage?.output_tokens,
  };
}

function getArabicSystemPrompt() {
  return [
    'أنت مساعد معلم سعودي متخصص في التحضير لمنصة مدرستي.',
    'جهز تحضيراً موجزاً، عملياً، ومناسباً للمنهج السعودي الحديث.',
    'اكتب بالعربية الفصحى المبسطة، واجعل كل حقل مناسباً للنسخ داخل منصة مدرستي.',
    'أعد JSON فقط، بدون شرح إضافي، واملأ جميع الحقول المطلوبة.',
  ].join(' ');
}

function buildGenerationPayload(lesson: Record<string, unknown>, references: ReferenceRow[]) {
  return {
    lesson,
    curriculum_references: references.map((reference) => ({
      title: reference.title,
      document_type: reference.document_type,
      curriculum_year: reference.curriculum_year,
      subject: reference.subject,
      grade: reference.grade,
      term: reference.term,
      version: reference.version,
      storage_path: reference.storage_path,
    })),
    required_fields: fields,
  };
}

function getGeminiPreparationSchema() {
  return {
    type: 'object',
    properties: Object.fromEntries(fields.map((field) => [field, { type: 'string' }])),
    required: fields,
  };
}

function getOpenAiPreparationSchema() {
  return {
    type: 'object',
    properties: Object.fromEntries(fields.map((field) => [field, { type: 'string' }])),
    required: fields,
    additionalProperties: false,
  };
}

function parsePreparationJson(text: string) {
  const parsed = JSON.parse(text);
  return Object.fromEntries(fields.map((field) => [field, String(parsed[field] ?? '')]));
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message);
  }
  return 'Unexpected error.';
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function findReferences(adminClient: ReturnType<typeof createClient>, lesson: Record<string, string>) {
  let query = adminClient
    .from('curriculum_documents')
    .select('id,title,document_type,curriculum_year,subject,grade,term,version,storage_path')
    .eq('is_active', true);

  if (lesson.curriculum_year) query = query.eq('curriculum_year', lesson.curriculum_year);
  if (lesson.subject) query = query.eq('subject', lesson.subject);
  if (lesson.grade) query = query.eq('grade', lesson.grade);
  if (lesson.term) query = query.eq('term', lesson.term);

  const { data, error } = await query.limit(12);
  if (error) {
    console.error(error);
    return [];
  }
  return data ?? [];
}
