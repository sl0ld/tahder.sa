import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const fields = ['objectives', 'strategies', 'resources', 'closure', 'enrichment', 'assignment', 'hints', 'activities'];

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
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
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
    const { data: log, error: logError } = await adminClient
      .from('generation_logs')
      .insert({
        user_id: userId,
        lesson_context: { ...lesson, references: references.map((reference) => reference.id) },
        provider: 'openai',
        model: Deno.env.get('OPENAI_MODEL') ?? 'gpt-5-mini',
      })
      .select('id')
      .single();

    if (logError) throw logError;

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
        model: Deno.env.get('OPENAI_MODEL') ?? 'gpt-5-mini',
        instructions: 'أنت مساعد معلم سعودي. جهز تحضيراً موجزاً ومناسباً للمنهج. أعد JSON فقط واملأ جميع الحقول المطلوبة باللغة العربية.',
        input: JSON.stringify({
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
        }),
        text: {
          format: {
            type: 'json_schema',
            name: 'lesson_preparation',
            strict: true,
            schema: {
              type: 'object',
              properties: Object.fromEntries(fields.map((field) => [field, { type: 'string' }])),
              required: fields,
              additionalProperties: false,
            },
          },
        },
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message ?? 'AI generation failed.');
    }

    const content = JSON.parse(extractOutputText(result));
    const { data: preparation, error: preparationError } = await adminClient
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

    await adminClient
      .from('generation_logs')
      .update({
        preparation_id: preparation.id,
        status: 'completed',
        prompt_tokens: result.usage?.input_tokens,
        output_tokens: result.usage?.output_tokens,
        completed_at: new Date().toISOString(),
      })
      .eq('id', log.id);

    return json(preparation);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unexpected error.' }, 500);
  }
});

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
  if (error) throw error;
  return data ?? [];
}
