import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Pressable,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button, Card, GhostDivider, Pill, ProgressBar, SectionTitle, StatCard, SwipeAttendanceRow } from './ui';
import { theme } from './theme';
import {
  activitySummary,
  attendanceQuickMarks,
  attendanceSession,
  attendanceStudents,
  attendanceSummary,
  daySummary,
  linkedAssignment,
  madrastiClassTypes,
  madrastiExportLog,
  madrastiGenerationSteps,
  madrastiPrepFields,
  madrastiPrepRequest,
  madrastiSavedPreps,
  prepActions,
  prepLessonOptions,
  priorityTasks,
  quickActions,
  submissionStatus,
  teacherProfile,
  todayClasses,
  worksheetLibrary,
} from './data';

type HomeScreenProps = {
  onJumpTo: (key: string) => void;
};

type PrepLesson = (typeof prepLessonOptions)[number];
type MadrastiField = {
  key: string;
  title: string;
  quality: string;
  text: string;
};
type MadrastiCompactItem = {
  title: string;
  meta: string;
  status: string;
};

type MadrastiLogItem = {
  title: string;
  time: string;
  status: string;
};

type PrepWorkspaceTab = 'madrasti' | 'curriculum' | 'details';

type CurriculumLesson = {
  id: string;
  title: string;
  unit: string;
  type: string;
  status: string;
};

type CurriculumWeek = {
  id: string;
  label: string;
  dateRange: string;
  load: number;
  lessons: CurriculumLesson[];
};

const wajibatiDistributionWeeks: CurriculumWeek[] = [
  {
    id: 'week-1',
    label: 'الأسبوع 1',
    dateRange: 'بداية الفصل الثاني',
    load: 82,
    lessons: [
      { id: 'wajibati-unit-3-intro', title: 'الوحدة الثالثة: الوطن ولاء وعطاء', unit: 'الوطن ولاء وعطاء', type: 'وحدة', status: 'جاهز للتحضير' },
      { id: 'wajibati-saudi-home', title: 'وطني المملكة العربية السعودية', unit: 'الوطن ولاء وعطاء', type: 'درس', status: 'جاهز للتحضير' },
    ],
  },
  {
    id: 'week-2',
    label: 'الأسبوع 2',
    dateRange: 'توزيع واجباتي',
    load: 74,
    lessons: [
      { id: 'wajibati-oral-presentation', title: 'تقديم عرض شفهي لسيرة مخترع أو مكتشف', unit: 'مخترعون ومكتشفون', type: 'مهارة', status: 'يحتاج تحضير' },
      { id: 'wajibati-madda', title: 'رسم المدة في أول الكلمة ووسطها', unit: 'مخترعون ومكتشفون', type: 'إملاء', status: 'جاهز للتحضير' },
    ],
  },
  {
    id: 'week-3',
    label: 'الأسبوع 3',
    dateRange: 'منتصف التوزيع',
    load: 68,
    lessons: [
      { id: 'wajibati-inventors-unit', title: 'الوحدة الرابعة: مخترعون ومكتشفون', unit: 'مخترعون ومكتشفون', type: 'وحدة', status: 'جاهز للتحضير' },
      { id: 'wajibati-lit-fingers', title: 'أنامل أضاءت طريق أصحابها', unit: 'مخترعون ومكتشفون', type: 'قراءة', status: 'يحتاج مراجعة' },
    ],
  },
  {
    id: 'week-4',
    label: 'الأسبوع 4',
    dateRange: 'قبل التقويم',
    load: 57,
    lessons: [
      { id: 'wajibati-hamza-line', title: 'الهمزة المتوسطة المفردة على السطر', unit: 'مخترعون ومكتشفون', type: 'إملاء', status: 'جاهز للتحضير' },
      { id: 'wajibati-review', title: 'مراجعة الوحدة وتثبيت المهارات', unit: 'مخترعون ومكتشفون', type: 'مراجعة', status: 'مقترح' },
    ],
  },
];

function lessonFromCurriculum(item: CurriculumLesson): PrepLesson {
  return {
    id: item.id,
    stage: 'المرحلة الابتدائية',
    grade: 'الصف الخامس',
    subject: 'لغتي الجميلة',
    term: 'الفصل الدراسي الثاني 1447',
    unit: item.unit,
    lesson: item.title,
    className: 'الخامس - أ',
    duration: '45 دقيقة',
    readiness: item.status === 'يحتاج مراجعة' ? '78%' : '91%',
    sections: [
      {
        title: 'الأهداف',
        tone: 'primary' as const,
        items: [
          `أن يحدد الطالب الفكرة أو المهارة الرئيسة في ${item.title}.`,
          'أن يطبق المهارة في نشاط قصير مرتبط بنصوص لغتي.',
          'أن يشارك بإجابة شفوية أو كتابية تعكس فهمه للدرس.',
        ],
      },
      {
        title: 'التمهيد',
        tone: 'teal' as const,
        items: [
          `عرض سؤال افتتاحي مرتبط بوحدة ${item.unit}.`,
          'ربط الدرس بخبرة الطالب اليومية ثم قراءة عنوان الدرس.',
        ],
      },
      {
        title: 'الاستراتيجيات',
        tone: 'amber' as const,
        items: [
          'قراءة موجهة.',
          'فكر، زاوج، شارك.',
          'تظليل الدليل من النص قبل الإجابة.',
        ],
      },
      {
        title: 'الوسائل التعليمية',
        tone: 'primary' as const,
        items: [
          'نص الدرس أو بطاقة المهارة.',
          'سبورة تفاعلية ومنظم بصري.',
          'ورقة تطبيق قصيرة.',
        ],
      },
      {
        title: 'التقويم والإغلاق',
        tone: 'rose' as const,
        items: [
          'سؤال خروج يقيس فهم المفهوم الرئيس.',
          'مشاركة إجابة نموذجية وتصحيح سريع.',
        ],
      },
    ],
    assignment: {
      title: `واجب تفاعلي: ${item.title}`,
      questions: item.type === 'إملاء' ? '5 تطبيقات إملائية' : '4 أسئلة فهم',
      time: '7 دقائق',
      grading: 'تصحيح تلقائي',
      linkedTo: 'كشف لغتي والمشاركة',
    },
  };
}

const wajibatiPrepLessonOptions = wajibatiDistributionWeeks.flatMap((week) =>
  week.lessons.map(lessonFromCurriculum),
);

const MADRASATI_URL = 'https://schools.madrasati.sa/?Language=1';
const EMBEDDED_PLATFORM_URLS = {
  madrasati: 'https://schools.madrasati.sa/?Language=1',
  noor: 'https://noor.moe.gov.sa/Noor/Login.aspx',
} as const;
const BROWSER_TEST_URL = 'https://ar.wikipedia.org/wiki/%D8%A7%D9%84%D8%B5%D9%81%D8%AD%D8%A9_%D8%A7%D9%84%D8%B1%D8%A6%D9%8A%D8%B3%D9%8A%D8%A9';

const EXTENSION_INSTALL_STEPS = [
  'افتح الرابط في Chrome كصفحة كاملة.',
  'سجل دخولك في منصة مدرستي.',
  'الإضافة تظهر كزر جانبي فوق صفحة التحضير.',
  'اضغط تعبئة تلقائية ليتم لصق حقول التحضير.',
];

export function PlatformBrowserScreen({
  platform,
}: {
  platform: keyof typeof EMBEDDED_PLATFORM_URLS;
}) {
  const config = platform === 'madrasati'
    ? {
      title: 'مدرستي',
      label: 'منصة مدرستي',
      url: EMBEDDED_PLATFORM_URLS.madrasati,
      color: '#147AD6',
      helper: 'افتح التحضير داخل مدرستي ثم اضغط الإضافة التلقائية للصق حقول التحضير.',
      cta: 'إضافة تحضير تلقائي',
    }
    : {
      title: 'نور',
      label: 'نظام نور',
      url: EMBEDDED_PLATFORM_URLS.noor,
      color: '#5B4BC4',
      helper: 'افتح بيانات الطالب أو التقارير داخل نور ثم استخدم الإضافة السريعة للمتابعة.',
      cta: 'إضافة بيانات تلقائية',
  };
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [assistantReady, setAssistantReady] = React.useState(false);
  const [frameLoaded, setFrameLoaded] = React.useState(false);
  const [showFallback, setShowFallback] = React.useState(false);
  const [currentUrl, setCurrentUrl] = React.useState<string>(config.url);

  React.useEffect(() => {
    setFrameLoaded(false);
    setShowFallback(false);
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, 4500);

    return () => clearTimeout(timer);
  }, [platform, refreshKey, currentUrl]);

  React.useEffect(() => {
    setCurrentUrl(config.url);
  }, [config.url]);

  const openExternal = () => {
    Linking.openURL(currentUrl);
  };

  const browserFrame = Platform.OS === 'web'
    ? React.createElement('iframe' as never, {
      key: refreshKey,
      src: currentUrl,
      title: config.label,
      style: styles.platformIframe,
      onLoad: () => setFrameLoaded(true),
      sandbox: 'allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox',
    } as never)
    : (
      <View style={styles.platformNativePlaceholder}>
        <MaterialCommunityIcons name="web" size={42} color={config.color} />
        <Text style={styles.platformPlaceholderTitle}>WebView جاهز للجوال</Text>
        <Text style={styles.platformPlaceholderText}>
          في تطبيق iOS/Android سيتم فتح {config.label} هنا داخل التطبيق مع بقاء الفوتر.
        </Text>
      </View>
    );

  return (
    <View style={styles.platformPage}>
      <View style={[styles.platformTopBar, { backgroundColor: config.color }]}>
        <Pressable onPress={openExternal} style={styles.platformIconButton}>
          <MaterialCommunityIcons name="download-outline" size={22} color="#FFFFFF" />
        </Pressable>
        <Pressable style={styles.platformIconButton}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
        </Pressable>
        <Pressable onPress={() => setRefreshKey((key) => key + 1)} style={styles.platformIconButton}>
          <MaterialCommunityIcons name="refresh" size={23} color="#FFFFFF" />
        </Pressable>
        <View style={styles.platformTitleWrap}>
          <Text style={styles.platformTitle}>{config.title}</Text>
        </View>
        <Pressable style={styles.platformIconButton}>
          <MaterialCommunityIcons name="menu" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.platformContent}>
        <View style={styles.browserAddressBar}>
          <Text style={styles.browserAddressText} numberOfLines={1}>{currentUrl}</Text>
          <Button label="اختبار المتصفح" compact secondary onPress={() => setCurrentUrl(BROWSER_TEST_URL)} />
        </View>
        {browserFrame}
        {platform === 'madrasati' ? (
          <View style={styles.extensionHintStrip}>
            <MaterialCommunityIcons name="puzzle-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.extensionHintText}>
              هنا سيكون المتصفح الداخلي، وفوقه إضافة تحضيري للتعبئة التلقائية.
            </Text>
          </View>
        ) : null}
        {Platform.OS === 'web' && showFallback && !frameLoaded ? (
          <View style={styles.platformFallbackCard}>
            <MaterialCommunityIcons name="shield-lock-outline" size={30} color={config.color} />
            <Text style={styles.platformFallbackTitle}>الموقع لم يظهر داخل المتصفح الداخلي</Text>
            <Text style={styles.platformFallbackText}>
              إذا فتح زر اختبار المتصفح فهذا يعني أن المتصفح شغال، والمشكلة من حماية الموقع أو من وصول الرابط.
            </Text>
            <Button label={`فتح ${config.title} خارجياً`} compact onPress={openExternal} />
          </View>
        ) : null}
        <View style={styles.platformAssistantCard}>
          <View style={styles.platformAssistantHeader}>
            <Pill label={assistantReady ? 'الإضافة جاهزة' : 'تجريبي'} tone={assistantReady ? 'teal' : 'primary'} />
            <Text style={styles.platformAssistantTitle}>الإضافة التلقائية</Text>
          </View>
          <Text style={styles.platformAssistantText}>{config.helper}</Text>
          <View style={styles.platformAssistantActions}>
            <Button
              label={assistantReady ? 'جاهزة للصق' : config.cta}
              compact
              onPress={() => setAssistantReady(true)}
            />
            <Button label="فتح خارجي" compact secondary onPress={openExternal} />
          </View>
        </View>
      </View>
    </View>
  );
}

export function HomeScreen({ onJumpTo }: HomeScreenProps) {
  const nextClass = todayClasses[1];

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.todayPanel}>
        <View style={styles.todayHeader}>
          <View style={styles.todayCopy}>
            <Text style={styles.eyebrow}>الحصة القادمة</Text>
            <Text style={styles.todayTitle}>{teacherProfile.nextClass}</Text>
            <Text style={styles.todayMeta}>{nextClass.lesson} · {nextClass.room}</Text>
          </View>
          <View style={styles.timeBlock}>
            <Text style={styles.timeBlockValue}>{nextClass.time}</Text>
            <Text style={styles.timeBlockLabel}>صباحاً</Text>
          </View>
        </View>

        <View style={styles.todayActions}>
          <Button label="تحضير الحصة" compact onPress={() => onJumpTo('prep')} />
          <Button label="رصد الفصل" compact secondary onPress={() => onJumpTo('attendance')} />
        </View>
      </View>

      <View style={styles.summaryGrid}>
        {daySummary.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            accent={item.tone}
          />
        ))}
      </View>

      <SectionTitle title="حصص اليوم" actionLabel="إدارة الجدول" onActionPress={() => onJumpTo('schedule')} />
      {todayClasses.map((item) => (
        <ClassRow key={item.id} item={item} onJumpTo={onJumpTo} />
      ))}

      <SectionTitle title="المهام العاجلة" actionLabel="عرض التقارير" onActionPress={() => onJumpTo('reports')} />
      {priorityTasks.map((task) => (
        <TaskRow key={task.title} task={task} onJumpTo={onJumpTo} />
      ))}

      <SectionTitle title="اختصارات العمل" />
      <View style={styles.quickGrid}>
        {quickActions.map((item) => (
          <QuickAction
            key={item.title}
            title={item.title}
            meta={item.meta}
            tone={item.tone}
            onPress={() => onJumpTo(item.target)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function sectionText(lesson: PrepLesson, index: number, fallback: string) {
  return lesson.sections[index]?.items.join(' ') ?? fallback;
}

function applyClassTypeText(text: string, classType: string) {
  if (classType === 'عن بعد') {
    return `${text} ينفذ النشاط عبر منصة مدرستي مع مشاركة تفاعلية قصيرة وسؤال تحقق في نهاية اللقاء.`;
  }

  if (classType === 'علاجية') {
    return `${text} تبسط المهمة إلى خطوات صغيرة مع مثال محلول وتدريب قصير للطلاب المتعثرين.`;
  }

  if (classType === 'إثرائية') {
    return `${text} يضاف تحد تطبيقي للطلاب المتقدمين يربط المهارة بموقف جديد.`;
  }

  return text;
}

function buildMadrastiFields(lesson: PrepLesson, classType: string, run = 1): MadrastiField[] {
  const goals = sectionText(lesson, 0, `أن يحقق الطالب مهارة درس ${lesson.lesson}.`);
  const warmup = sectionText(lesson, 1, `تمهيد قصير يربط خبرات الطلاب بعنوان ${lesson.lesson}.`);
  const strategies = sectionText(lesson, 2, 'تعلم تعاوني، نمذجة، تطبيق فردي، وتغذية راجعة مباشرة.');
  const resources = sectionText(lesson, 3, 'سبورة تفاعلية، بطاقات تعلم، وورقة عمل قصيرة.');
  const assessment = sectionText(lesson, 4, 'ملاحظة الأداء، سؤال خروج، وتطبيق قصير.');
  const aiMark = run > 1 ? ` نسخة AI ${run}.` : '';

  return [
    {
      key: 'outcomes',
      title: 'نواتج التعلم',
      quality: 'مناسب',
      text: applyClassTypeText(`يتوقع من الطالب في نهاية درس ${lesson.lesson} أن يطبق المهارة الأساسية بدقة ويشرح طريقة الحل أو الفهم بأسلوبه.${aiMark}`, classType),
    },
    {
      key: 'goals',
      title: 'الأهداف',
      quality: 'مناسب',
      text: applyClassTypeText(goals, classType),
    },
    {
      key: 'warmup',
      title: 'التهيئة',
      quality: 'مناسب',
      text: applyClassTypeText(warmup, classType),
    },
    {
      key: 'vocabulary',
      title: 'المفردات',
      quality: 'يحتاج مراجعة',
      text: `مفردات الدرس: ${lesson.lesson}، المفهوم الرئيس، تطبيق، تحقق، تقويم. يراجعها المعلم قبل النسخ النهائي.`,
    },
    {
      key: 'strategies',
      title: 'الاستراتيجيات',
      quality: 'مناسب',
      text: applyClassTypeText(strategies, classType),
    },
    {
      key: 'resources',
      title: 'الوسائل التعليمية',
      quality: 'مناسب',
      text: applyClassTypeText(resources, classType),
    },
    {
      key: 'activities',
      title: 'الأنشطة الصفية',
      quality: 'مناسب',
      text: applyClassTypeText(`نشاط افتتاحي قصير، تطبيق جماعي على ${lesson.lesson}، ثم تدريب فردي يقيس تحقق الهدف.`, classType),
    },
    {
      key: 'assessment',
      title: 'التقويم',
      quality: 'مناسب',
      text: applyClassTypeText(assessment, classType),
    },
    {
      key: 'homework',
      title: 'الواجب',
      quality: 'مناسب',
      text: `واجب تفاعلي مرتبط بدرس ${lesson.lesson}: ${lesson.assignment.questions}، مدة الحل ${lesson.assignment.time}، مع ${lesson.assignment.grading}.`,
    },
    {
      key: 'closure',
      title: 'الإغلاق',
      quality: 'مناسب',
      text: applyClassTypeText(`تلخيص سريع لأهم فكرة في درس ${lesson.lesson} وطلب إجابة ختامية من طالبين قبل إنهاء الحصة.`, classType),
    },
  ];
}

function getClassTypeNote(classType: string) {
  if (classType === 'عن بعد') {
    return 'تمت مواءمته للحصة عن بعد';
  }

  if (classType === 'علاجية') {
    return 'تم تبسيطه للخطة العلاجية';
  }

  if (classType === 'إثرائية') {
    return 'تم رفع مستوى التحدي';
  }

  return 'جاهز للحصة الحضورية';
}

function getMadrastiStepStatuses({
  generated,
  copied,
  saved,
  microsoftConnected,
  synced,
}: {
  generated: boolean;
  copied: boolean;
  saved: boolean;
  microsoftConnected: boolean;
  synced: boolean;
}) {
  return madrastiGenerationSteps.map((step, index) => {
    const statuses = [
      'مكتمل',
      generated ? 'مكتمل' : 'جاهز',
      generated ? 'جاهز للتعديل' : 'بانتظار التوليد',
      copied ? 'تم النسخ' : 'جاهز',
      generated ? 'مفعّل' : 'جاهز',
      saved ? 'محفوظ' : 'جاهز',
      copied || saved ? 'محدث' : 'جاهز',
      microsoftConnected ? 'متصل' : 'تجريبي',
      synced ? 'تمت المزامنة' : microsoftConnected ? 'جاهز' : 'بانتظار المصادقة',
    ];

    return { ...step, status: statuses[index] ?? step.status };
  });
}

export function LessonPrepScreen() {
  const allPrepLessonOptions = React.useMemo(
    () => [...wajibatiPrepLessonOptions, ...prepLessonOptions],
    [],
  );
  const [selectedLessonId, setSelectedLessonId] = React.useState(wajibatiPrepLessonOptions[0].id);
  const [activeClassType, setActiveClassType] = React.useState(madrastiPrepRequest.classType);
  const selectedLesson = allPrepLessonOptions.find((lesson) => lesson.id === selectedLessonId) ?? allPrepLessonOptions[0];
  const [madrastiFields, setMadrastiFields] = React.useState<MadrastiField[]>(() =>
    buildMadrastiFields(selectedLesson, madrastiPrepRequest.classType),
  );
  const [generationRun, setGenerationRun] = React.useState(1);
  const [editingKey, setEditingKey] = React.useState<string | null>(null);
  const [copyCount, setCopyCount] = React.useState(0);
  const [microsoftConnected, setMicrosoftConnected] = React.useState(false);
  const [syncState, setSyncState] = React.useState<'idle' | 'synced'>('idle');
  const [quickExtensionReady, setQuickExtensionReady] = React.useState(false);
  const [activePrepTab, setActivePrepTab] = React.useState<PrepWorkspaceTab>('madrasti');
  const [savedPreps, setSavedPreps] = React.useState<MadrastiCompactItem[]>(madrastiSavedPreps);
  const [exportLog, setExportLog] = React.useState<MadrastiLogItem[]>(madrastiExportLog);
  const selectedPrepMeta = [
    { label: 'المرحلة', value: selectedLesson.stage },
    { label: 'الصف', value: selectedLesson.grade },
    { label: 'المادة', value: selectedLesson.subject },
    { label: 'الفصل', value: selectedLesson.term },
    { label: 'الوحدة', value: selectedLesson.unit },
    { label: 'مدة الحصة', value: selectedLesson.duration },
  ];

  React.useEffect(() => {
    setMadrastiFields(buildMadrastiFields(selectedLesson, activeClassType, generationRun));
    setEditingKey(null);
    setSyncState('idle');
  }, [activeClassType, generationRun, selectedLesson]);

  const addExportLog = React.useCallback((title: string, status = 'ناجح') => {
    setExportLog((items) => [
      { title, time: 'الآن', status },
      ...items.slice(0, 5),
    ]);
  }, []);

  const handleGenerate = () => {
    setGenerationRun((run) => run + 1);
    setEditingKey(null);
    addExportLog(`توليد مسودة AI: ${selectedLesson.lesson}`);
  };

  const handleFieldChange = (key: string, text: string) => {
    setMadrastiFields((fields) =>
      fields.map((field) => (field.key === key ? { ...field, text, quality: 'معدل' } : field)),
    );
  };

  const handleQuickEdit = (key: string, mode: 'shorten' | 'improve') => {
    setMadrastiFields((fields) =>
      fields.map((field) => {
        if (field.key !== key) {
          return field;
        }

        const text = mode === 'shorten'
          ? `صياغة مختصرة: ${field.text.split('،').slice(0, 2).join('،')}.`
          : `${field.text} مع تعزيز الربط بالمهارة الأساسية وقياس تحققها بنهاية الحصة.`;

        return { ...field, text, quality: 'معدل' };
      }),
    );
    addExportLog(mode === 'shorten' ? 'تعديل سريع: اختصار حقل' : 'تعديل سريع: تحسين حقل');
  };

  const handleRegenerateField = (key: string) => {
    const freshFields = buildMadrastiFields(selectedLesson, activeClassType, generationRun + 1);

    setMadrastiFields((fields) =>
      fields.map((field) => {
        const fresh = freshFields.find((item) => item.key === key);
        return fresh ? { ...fresh, quality: 'معاد توليده' } : field;
      }),
    );
    setGenerationRun((run) => run + 1);
    addExportLog('إعادة توليد حقل واحد');
  };

  const handleCopyField = (field: MadrastiField) => {
    setCopyCount((count) => count + 1);
    addExportLog(`نسخ حقل ${field.title}`);
  };

  const handleCopyAll = () => {
    setCopyCount((count) => count + madrastiFields.length);
    addExportLog(`نسخ ${madrastiFields.length} حقول بصيغة مدرستي`);
  };

  const handlePrepareQuickExtension = () => {
    setQuickExtensionReady(true);
    setCopyCount((count) => count + madrastiFields.length);
    addExportLog('تجهيز الإضافة السريعة لمدرستي', 'جاهزة');
  };

  const handleOpenMadrasati = () => {
    addExportLog('فتح منصة مدرستي من صفحة التحضير', 'تم الفتح');
    Linking.openURL(MADRASATI_URL);
  };

  const handleSavePrep = () => {
    setSavedPreps((items) => [
      {
        title: selectedLesson.lesson,
        meta: `${selectedLesson.subject} · ${selectedLesson.className}`,
        status: 'محفوظ',
      },
      ...items.filter((item) => item.title !== selectedLesson.lesson).slice(0, 4),
    ]);
    addExportLog(`حفظ تحضير ${selectedLesson.lesson}`);
  };

  const handleAuthMicrosoft = () => {
    setMicrosoftConnected(true);
    addExportLog('مصادقة Microsoft التجريبية', 'متصل');
  };

  const handleSyncMadrasti = () => {
    if (!microsoftConnected) {
      addExportLog('مزامنة مدرستي تحتاج مصادقة', 'بانتظار المصادقة');
      return;
    }

    setSyncState('synced');
    addExportLog(`مزامنة ${selectedLesson.lesson} مع مدرستي`, 'تمت المزامنة');
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.prepHero}>
        <View style={styles.prepHeroTop}>
          <View style={styles.prepHeroCopy}>
            <Text style={styles.eyebrow}>التحضير الذكي</Text>
            <Text style={styles.prepHeroTitle}>{selectedLesson.lesson}</Text>
            <Text style={styles.prepHeroMeta}>
              {selectedLesson.subject} · {selectedLesson.className} · {selectedLesson.duration}
            </Text>
          </View>
          <View style={styles.aiScore}>
            <Text style={styles.aiScoreValue}>{selectedLesson.readiness}</Text>
            <Text style={styles.aiScoreLabel}>جاهزية</Text>
          </View>
        </View>

        <View style={styles.aiBanner}>
          <MaterialCommunityIcons name="auto-fix" size={20} color="#FFFFFF" />
          <Text style={styles.aiBannerText}>تم توليد مسودة متوافقة مع بيانات الدرس</Text>
        </View>
      </View>

      <PrepWorkspaceSwitch activeTab={activePrepTab} onChangeTab={setActivePrepTab} />

      {activePrepTab === 'curriculum' ? (
        <CurriculumDistributionTool
          selectedLessonId={selectedLessonId}
          onSelectLesson={setSelectedLessonId}
        />
      ) : null}

      {activePrepTab === 'details' ? (
        <View style={styles.prepDetailsPanel}>
          <SectionTitle title="بيانات الدرس" actionLabel="تعديل" />
          <View style={styles.metaGrid}>
            {selectedPrepMeta.map((item) => (
              <PrepMetaTile key={item.label} label={item.label} value={item.value} />
            ))}
          </View>

          <SectionTitle title="عناصر التحضير" actionLabel="تعديل سريع" />
          {selectedLesson.sections.map((section) => (
            <PrepSection key={section.title} section={section} />
          ))}

          <SectionTitle title="واجب مرتبط تلقائياً" />
          <Card style={styles.assignmentCard}>
            <View style={styles.assignmentHeader}>
              <Pill label={selectedLesson.assignment.grading} tone="teal" />
              <Text style={styles.assignmentTitle}>{selectedLesson.assignment.title}</Text>
            </View>
            <View style={styles.assignmentStats}>
              <InfoChip icon="help-circle-outline" label={selectedLesson.assignment.questions} />
              <InfoChip icon="clock-outline" label={selectedLesson.assignment.time} />
              <InfoChip icon="chart-line" label={selectedLesson.assignment.linkedTo} />
            </View>
            <Button label="إرسال الواجب بعد الحفظ" secondary />
          </Card>

          <View style={styles.prepActionGrid}>
            {prepActions.map((action) => (
              <Pressable key={action.label} style={styles.prepActionButton}>
                <MaterialCommunityIcons
                  name={action.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.prepActionText}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {activePrepTab === 'madrasti' ? (
        <MadrastiPrepPanel
          lesson={selectedLesson}
          activeClassType={activeClassType}
          onChangeClassType={setActiveClassType}
          fields={madrastiFields}
          savedPreps={savedPreps}
          exportLog={exportLog}
          editingKey={editingKey}
          copyCount={copyCount}
          microsoftConnected={microsoftConnected}
          syncState={syncState}
          quickExtensionReady={quickExtensionReady}
          onGenerate={handleGenerate}
          onCopyAll={handleCopyAll}
          onPrepareQuickExtension={handlePrepareQuickExtension}
          onOpenMadrasati={handleOpenMadrasati}
          onSavePrep={handleSavePrep}
          onAuthMicrosoft={handleAuthMicrosoft}
          onSyncMadrasti={handleSyncMadrasti}
          onToggleEdit={(key) => setEditingKey((current) => (current === key ? null : key))}
          onChangeField={handleFieldChange}
          onQuickEdit={handleQuickEdit}
          onRegenerateField={handleRegenerateField}
          onCopyField={handleCopyField}
        />
      ) : null}
    </ScrollView>
  );
}

function PrepWorkspaceSwitch({
  activeTab,
  onChangeTab,
}: {
  activeTab: PrepWorkspaceTab;
  onChangeTab: (tab: PrepWorkspaceTab) => void;
}) {
  const tabs: Array<{
    key: PrepWorkspaceTab;
    title: string;
    meta: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
  }> = [
    { key: 'madrasti', title: 'مدرستي AI', meta: 'توليد ونسخ', icon: 'auto-fix' },
    { key: 'curriculum', title: 'التوزيع', meta: 'اختيار الدرس', icon: 'calendar-text-outline' },
    { key: 'details', title: 'التفاصيل', meta: 'الأهداف والواجب', icon: 'file-document-edit-outline' },
  ];

  return (
    <View style={styles.prepModeGrid}>
      {tabs.map((tab) => {
        const active = tab.key === activeTab;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onChangeTab(tab.key)}
            style={[styles.prepModeButton, active && styles.prepModeButtonActive]}
          >
            <MaterialCommunityIcons
              name={tab.icon}
              size={19}
              color={active ? '#FFFFFF' : theme.colors.primary}
            />
            <View style={styles.prepModeCopy}>
              <Text style={[styles.prepModeTitle, active && styles.prepModeTitleActive]}>{tab.title}</Text>
              <Text style={[styles.prepModeMeta, active && styles.prepModeMetaActive]}>{tab.meta}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function CurriculumDistributionTool({
  selectedLessonId,
  onSelectLesson,
}: {
  selectedLessonId: string;
  onSelectLesson: (lessonId: string) => void;
}) {
  const [rescheduled, setRescheduled] = React.useState(false);
  const totalLessons = wajibatiDistributionWeeks.reduce((total, week) => total + week.lessons.length, 0);
  const completedWeeks = rescheduled ? 2 : 1;

  return (
    <View style={styles.distributionTool}>
      <View style={styles.distributionHeader}>
        <View style={styles.distributionTitleWrap}>
          <Text style={styles.eyebrow}>أداة توزيع المنهج</Text>
          <Text style={styles.distributionTitle}>توزيع لغتي خامس ابتدائي الفصل الثاني</Text>
          <Text style={styles.distributionMeta}>مبني على نموذج واجباتي: PDF / Word / عرض مباشر</Text>
        </View>
        <View style={styles.distributionBadge}>
          <Text style={styles.distributionBadgeValue}>1447</Text>
          <Text style={styles.distributionBadgeLabel}>فصل 2</Text>
        </View>
      </View>

      <View style={styles.distributionStats}>
        <StatCard label="الدروس" value={`${totalLessons}`} accent="primary" />
        <StatCard label="الأسابيع" value={`${wajibatiDistributionWeeks.length}`} accent="teal" />
        <StatCard label="المكتمل" value={`${completedWeeks}/${wajibatiDistributionWeeks.length}`} accent="amber" />
      </View>

      <View style={styles.distributionFilters}>
        <View style={styles.distributionFilter}>
          <Text style={styles.distributionFilterLabel}>المادة</Text>
          <Text style={styles.distributionFilterValue}>لغتي الجميلة</Text>
        </View>
        <View style={styles.distributionFilter}>
          <Text style={styles.distributionFilterLabel}>الصف</Text>
          <Text style={styles.distributionFilterValue}>الخامس الابتدائي</Text>
        </View>
        <View style={styles.distributionFilter}>
          <Text style={styles.distributionFilterLabel}>الفصل</Text>
          <Text style={styles.distributionFilterValue}>الثاني</Text>
        </View>
      </View>

      <View style={styles.distributionActions}>
        <Button label="تحميل PDF" compact secondary />
        <Button label="تحميل Word" compact secondary />
        <Button label={rescheduled ? 'تمت إعادة الجدولة' : 'إعادة توزيع ذكي'} compact onPress={() => setRescheduled(true)} />
      </View>

      {rescheduled ? (
        <View style={styles.rescheduleNotice}>
          <MaterialCommunityIcons name="calendar-sync-outline" size={19} color={theme.colors.teal} />
          <Text style={styles.rescheduleNoticeText}>
            تم ضغط التوزيع ونقل دروس المراجعة للأسبوع الرابع بعد افتراض تعليق حصة واحدة.
          </Text>
        </View>
      ) : null}

      <SectionTitle title="أسابيع التوزيع" actionLabel="استيراد ملف توزيع" />
      {wajibatiDistributionWeeks.map((week) => (
        <View key={week.id} style={styles.distributionWeek}>
          <View style={styles.distributionWeekHeader}>
            <Pill label={`${week.load}%`} tone={week.load > 70 ? 'teal' : 'amber'} />
            <View style={styles.distributionWeekCopy}>
              <Text style={styles.distributionWeekTitle}>{week.label}</Text>
              <Text style={styles.distributionWeekMeta}>{week.dateRange}</Text>
            </View>
          </View>

          {week.lessons.map((lesson) => {
            const active = lesson.id === selectedLessonId;

            return (
              <Pressable
                key={lesson.id}
                onPress={() => onSelectLesson(lesson.id)}
                style={[styles.distributionLessonRow, active && styles.distributionLessonRowActive]}
              >
                <Pill label={lesson.status} tone={lesson.status === 'يحتاج مراجعة' ? 'amber' : 'primary'} />
                <View style={styles.distributionLessonBody}>
                  <Text style={[styles.distributionLessonTitle, active && styles.distributionLessonTitleActive]}>
                    {lesson.title}
                  </Text>
                  <Text style={styles.distributionLessonMeta}>
                    {lesson.unit} · {lesson.type}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name={active ? 'check-circle' : 'file-document-edit-outline'}
                  size={21}
                  color={active ? theme.colors.teal : theme.colors.primary}
                />
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function MadrastiPrepPanel({
  lesson,
  activeClassType,
  onChangeClassType,
  fields,
  savedPreps,
  exportLog,
  editingKey,
  copyCount,
  microsoftConnected,
  syncState,
  quickExtensionReady,
  onGenerate,
  onCopyAll,
  onPrepareQuickExtension,
  onOpenMadrasati,
  onSavePrep,
  onAuthMicrosoft,
  onSyncMadrasti,
  onToggleEdit,
  onChangeField,
  onQuickEdit,
  onRegenerateField,
  onCopyField,
}: {
  lesson: PrepLesson;
  activeClassType: string;
  onChangeClassType: (value: string) => void;
  fields: MadrastiField[];
  savedPreps: MadrastiCompactItem[];
  exportLog: MadrastiLogItem[];
  editingKey: string | null;
  copyCount: number;
  microsoftConnected: boolean;
  syncState: 'idle' | 'synced';
  quickExtensionReady: boolean;
  onGenerate: () => void;
  onCopyAll: () => void;
  onPrepareQuickExtension: () => void;
  onOpenMadrasati: () => void;
  onSavePrep: () => void;
  onAuthMicrosoft: () => void;
  onSyncMadrasti: () => void;
  onToggleEdit: (key: string) => void;
  onChangeField: (key: string, text: string) => void;
  onQuickEdit: (key: string, mode: 'shorten' | 'improve') => void;
  onRegenerateField: (key: string) => void;
  onCopyField: (field: MadrastiField) => void;
}) {
  const [showMore, setShowMore] = React.useState(false);
  const steps = getMadrastiStepStatuses({
    generated: fields.length > 0,
    copied: copyCount > 0,
    saved: savedPreps.some((prep) => prep.title === lesson.lesson),
    microsoftConnected,
    synced: syncState === 'synced',
  });
  const visibleFields = showMore ? fields : fields.slice(0, 2);
  const hiddenFieldsCount = fields.length - visibleFields.length;

  return (
    <View style={styles.madrastiPanel}>
      <View style={styles.madrastiHeader}>
        <View style={styles.madrastiTitleWrap}>
          <Text style={styles.eyebrow}>تحضير مدرستي بالذكاء الاصطناعي</Text>
          <Text style={styles.madrastiTitle}>{lesson.lesson}</Text>
          <Text style={styles.madrastiMeta}>
            {lesson.subject} · {lesson.grade} · {lesson.term}
          </Text>
        </View>
        <View style={styles.madrastiBadge}>
          <Text style={styles.madrastiBadgeValue}>9</Text>
          <Text style={styles.madrastiBadgeLabel}>مراحل</Text>
        </View>
      </View>

      <View style={styles.classTypeGrid}>
        {madrastiClassTypes.map((type) => (
          <Pressable
            key={type.label}
            onPress={() => onChangeClassType(type.label)}
            style={[
              styles.classTypeButton,
              activeClassType === type.label && styles.classTypeButtonActive,
            ]}
          >
            <Text
              style={[
                styles.classTypeText,
                activeClassType === type.label && styles.classTypeTextActive,
              ]}
            >
              {type.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.madrastiActionRow}>
        <Button label="توليد تحضير مدرستي" compact onPress={onGenerate} />
        <Button label="نسخ الكل" compact secondary onPress={onCopyAll} />
      </View>

      <View style={styles.madrastiActionRow}>
        <Button label="حفظ في البنك" compact secondary onPress={onSavePrep} />
        <Button
          label={microsoftConnected ? 'Microsoft متصل' : 'مصادقة Microsoft'}
          compact
          secondary
          onPress={onAuthMicrosoft}
        />
      </View>

      <View style={styles.madrastiActionRow}>
        <Button label="فتح منصة مدرستي" compact onPress={onOpenMadrasati} />
        <Button
          label={quickExtensionReady ? 'الإضافة جاهزة' : 'تجهيز الإضافة السريعة'}
          compact
          secondary
          onPress={onPrepareQuickExtension}
        />
      </View>

      <Card style={styles.madrastiStatusCard}>
        <View style={styles.madrastiStatusRow}>
          <Pill
            label={syncState === 'synced' ? 'تمت المزامنة' : quickExtensionReady ? 'إضافة جاهزة' : 'جاهز للتجربة'}
            tone={syncState === 'synced' || quickExtensionReady ? 'teal' : 'primary'}
          />
          <View style={styles.madrastiStatusCopy}>
            <Text style={styles.madrastiStatusTitle}>نسخة تجربة مبدئية</Text>
            <Text style={styles.madrastiStatusText}>
              {copyCount} عملية نسخ · {savedPreps.length} تحاضير محفوظة · {quickExtensionReady ? 'الإضافة السريعة جاهزة' : 'الإضافة غير مجهزة'}
            </Text>
          </View>
        </View>
        <View style={styles.madrastiBridgeRow}>
          <MaterialCommunityIcons name="web" size={19} color={theme.colors.primary} />
          <Text style={styles.madrastiBridgeText}>
            افتح مدرستي، ثم استخدم الحقول الجاهزة من التطبيق للصقها في حقول التحضير. لاحقاً نربطها بمزامنة خلفية حقيقية.
          </Text>
        </View>
        <Button label="مزامنة مدرستي التجريبية" compact onPress={onSyncMadrasti} />
      </Card>

      <SectionTitle title="حقول مدرستي الجاهزة" actionLabel="نسخ بصيغة مدرستي" onActionPress={onCopyAll} />
      {visibleFields.map((field) => (
        <MadrastiFieldCard
          key={field.key}
          field={field}
          activeClassType={activeClassType}
          editing={editingKey === field.key}
          onToggleEdit={() => onToggleEdit(field.key)}
          onChangeText={(text) => onChangeField(field.key, text)}
          onQuickEdit={(mode) => onQuickEdit(field.key, mode)}
          onRegenerate={() => onRegenerateField(field.key)}
          onCopy={() => onCopyField(field)}
        />
      ))}

      <Pressable style={styles.madrastiMoreButton} onPress={() => setShowMore((value) => !value)}>
        <MaterialCommunityIcons
          name={showMore ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.colors.primary}
        />
        <Text style={styles.madrastiMoreText}>
          {showMore ? 'إخفاء التفاصيل' : `عرض ${hiddenFieldsCount} حقول إضافية والسجل`}
        </Text>
      </Pressable>

      {showMore ? (
        <>
          <SectionTitle title="خطة التوليد" actionLabel="سجل التنفيذ" />
          <View style={styles.generationGrid}>
            {steps.map((step) => (
              <View key={step.title} style={styles.generationStep}>
                <Text style={styles.generationStepTitle}>{step.title}</Text>
                <Text style={styles.generationStepStatus}>{step.status}</Text>
              </View>
            ))}
          </View>

          <SectionTitle title="بنك تحاضير مدرستي" actionLabel="بحث" />
          {savedPreps.map((prep) => (
            <MadrastiCompactRow key={prep.title} title={prep.title} meta={prep.meta} status={prep.status} />
          ))}

          <SectionTitle title="سجل النسخ والمزامنة" actionLabel="إعادة المحاولة" />
          {exportLog.map((log, index) => (
            <MadrastiCompactRow key={`${log.title}-${index}`} title={log.title} meta={log.time} status={log.status} />
          ))}
        </>
      ) : null}
    </View>
  );
}

function MadrastiFieldCard({
  field,
  activeClassType,
  editing,
  onToggleEdit,
  onChangeText,
  onQuickEdit,
  onRegenerate,
  onCopy,
}: {
  field: MadrastiField;
  activeClassType: string;
  editing: boolean;
  onToggleEdit: () => void;
  onChangeText: (text: string) => void;
  onQuickEdit: (mode: 'shorten' | 'improve') => void;
  onRegenerate: () => void;
  onCopy: () => void;
}) {
  const classTypeNote = getClassTypeNote(activeClassType);

  return (
    <Card style={styles.madrastiFieldCard}>
      <View style={styles.madrastiFieldHeader}>
        <Pill label={field.quality} tone={field.quality === 'مناسب' ? 'teal' : 'amber'} />
        <Text style={styles.madrastiFieldTitle}>{field.title}</Text>
      </View>
      {editing ? (
        <TextInput
          value={field.text}
          onChangeText={onChangeText}
          multiline
          textAlign="right"
          style={styles.madrastiFieldInput}
        />
      ) : (
        <Text style={styles.madrastiFieldText}>{field.text}</Text>
      )}
      <View style={styles.madrastiFieldActions}>
        <Pill label={classTypeNote} tone="primary" />
        <View style={styles.madrastiMiniActions}>
          <Pressable onPress={onCopy} style={styles.madrastiMiniAction}>
            <Text style={styles.madrastiMiniActionText}>نسخ</Text>
          </Pressable>
          <Pressable onPress={onRegenerate} style={styles.madrastiMiniAction}>
            <Text style={styles.madrastiMiniActionText}>إعادة توليد</Text>
          </Pressable>
          <Pressable onPress={() => onQuickEdit('shorten')} style={styles.madrastiMiniAction}>
            <Text style={styles.madrastiMiniActionText}>اختصر</Text>
          </Pressable>
          <Pressable onPress={() => onQuickEdit('improve')} style={styles.madrastiMiniAction}>
            <Text style={styles.madrastiMiniActionText}>حسن</Text>
          </Pressable>
          <Pressable onPress={onToggleEdit} style={styles.madrastiMiniAction}>
            <Text style={styles.madrastiMiniActionText}>{editing ? 'تم' : 'تعديل'}</Text>
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

function MadrastiCompactRow({
  title,
  meta,
  status,
}: {
  title: string;
  meta: string;
  status: string;
}) {
  return (
    <View style={styles.madrastiCompactRow}>
      <Pill label={status} tone={status === 'لاحقاً' ? 'muted' : status === 'مسودة' ? 'amber' : 'teal'} />
      <View style={styles.madrastiCompactBody}>
        <Text style={styles.madrastiCompactTitle}>{title}</Text>
        <Text style={styles.madrastiCompactMeta}>{meta}</Text>
      </View>
    </View>
  );
}

function PrepMetaTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaTile}>
      <Text style={styles.metaTileLabel}>{label}</Text>
      <Text style={styles.metaTileValue}>{value}</Text>
    </View>
  );
}

function PrepSection({
  section,
}: {
  section: (typeof prepLessonOptions)[number]['sections'][number];
}) {
  return (
    <Card style={styles.prepSectionCard}>
      <View style={styles.prepSectionHeader}>
        <View style={styles.editMiniButton}>
          <MaterialCommunityIcons name="pencil-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.editMiniText}>تعديل</Text>
        </View>
        <View style={styles.prepSectionTitleWrap}>
          <Pill label="مقترح" tone={section.tone} />
          <Text style={styles.fieldTitle}>{section.title}</Text>
        </View>
      </View>
      <View style={styles.sectionItems}>
        {section.items.map((item) => (
          <View key={item} style={styles.sectionItem}>
            <View style={[styles.sectionDot, quickToneStyles[section.tone]]} />
            <Text style={styles.sectionItemText}>{item}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

function InfoChip({
  icon,
  label,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.infoChip}>
      <MaterialCommunityIcons name={icon} size={17} color={theme.colors.primary} />
      <Text style={styles.infoChipText}>{label}</Text>
    </View>
  );
}

function WorksheetRow({
  item,
}: {
  item: (typeof worksheetLibrary)[number];
}) {
  return (
    <Card style={styles.worksheetCard}>
      <View style={styles.worksheetRow}>
        <View style={[styles.worksheetIcon, quickToneStyles[item.tone]]}>
          <MaterialCommunityIcons
            name={item.type.includes('كويز') ? 'clipboard-check-outline' : 'file-document-outline'}
            size={22}
            color={quickColorByTone[item.tone]}
          />
        </View>
        <View style={styles.worksheetBody}>
          <Text style={styles.worksheetTitle}>{item.title}</Text>
          <Text style={styles.worksheetMeta}>{item.lesson}</Text>
          <Text style={styles.worksheetStatus}>{item.status}</Text>
        </View>
        <Pressable style={styles.iconAction}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.primary} />
        </Pressable>
      </View>
    </Card>
  );
}

function SubmissionRow({
  student,
}: {
  student: (typeof submissionStatus)[number];
}) {
  return (
    <View style={styles.submissionRow}>
      <Pill label={student.status} tone={student.tone} />
      <View style={styles.submissionBody}>
        <Text style={styles.submissionName}>{student.name}</Text>
        <Text style={styles.submissionScore}>الدرجة: {student.score}</Text>
      </View>
    </View>
  );
}

function AttendanceStudentCard({
  student,
}: {
  student: (typeof attendanceStudents)[number];
}) {
  return (
    <Card style={styles.attendanceStudentCard}>
      <SwipeAttendanceRow name={student.name} role={student.role} avatar={student.avatar} />
      <View style={styles.studentSignals}>
        <Pill label={student.attendance} tone={student.tone} />
        <Pill label={student.participation} tone={student.tone === 'rose' ? 'muted' : 'primary'} />
        <Pill label={student.homework} tone={student.homework === 'مكتمل' ? 'teal' : 'amber'} />
      </View>
      <View style={styles.studentNote}>
        <MaterialCommunityIcons name="note-text-outline" size={18} color={theme.colors.primary} />
        <Text style={styles.studentNoteText}>{student.note}</Text>
      </View>
    </Card>
  );
}

export function AttendanceScreen() {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.attendancePanel}>
        <View style={styles.attendancePanelTop}>
          <View style={styles.attendanceCopy}>
            <Text style={styles.eyebrow}>متابعة الحصة</Text>
            <Text style={styles.attendanceTitle}>
              {attendanceSession.subject} · {attendanceSession.className}
            </Text>
            <Text style={styles.attendanceMeta}>
              {attendanceSession.lesson} · {attendanceSession.time}
            </Text>
          </View>
          <Pill label={attendanceSession.syncState} tone="amber" />
        </View>
        <ProgressBar value={82} accent="teal" />
        <Text style={styles.progressText}>تم رصد 82% من الفصل، وسيتم التزامن عند توفر الاتصال.</Text>
      </View>

      <View style={styles.summaryGrid}>
        {attendanceSummary.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} accent={item.tone} />
        ))}
      </View>

      <SectionTitle title="رصد سريع" actionLabel="حفظ ومزامنة" />
      <View style={styles.quickMarkGrid}>
        {attendanceQuickMarks.map((mark) => (
          <Pressable key={mark.label} style={[styles.quickMarkButton, quickToneStyles[mark.tone]]}>
            <MaterialCommunityIcons
              name={mark.icon as keyof typeof MaterialCommunityIcons.glyphMap}
              size={22}
              color={quickColorByTone[mark.tone]}
            />
            <Text style={styles.quickMarkText}>{mark.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionTitle title="قائمة الطلاب" actionLabel="فرز حسب الحالة" />
      {attendanceStudents.map((student) => (
        <AttendanceStudentCard key={student.name} student={student} />
      ))}
    </ScrollView>
  );
}

export function ContentScreen() {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.activityHero}>
        <View style={styles.activityHeroCopy}>
          <Text style={styles.eyebrow}>الواجبات والأنشطة</Text>
          <Text style={styles.activityHeroTitle}>نشاط مرتبط بالدرس جاهز للإرسال</Text>
          <Text style={styles.activityHeroMeta}>{linkedAssignment.lesson} · {linkedAssignment.dueDate}</Text>
        </View>
        <Button label="إرسال الآن" compact />
      </View>

      <View style={styles.summaryGrid}>
        {activitySummary.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} accent={item.tone} />
        ))}
      </View>

      <SectionTitle title="واجب مقترح" actionLabel="تعديل" />
      <Card style={styles.assignmentCard}>
        <View style={styles.assignmentHeader}>
          <Pill label={linkedAssignment.status} tone="primary" />
          <Text style={styles.assignmentTitle}>{linkedAssignment.title}</Text>
        </View>
        <View style={styles.quizQuestionList}>
          {linkedAssignment.questions.map((question, index) => (
            <View key={question} style={styles.quizQuestion}>
              <Text style={styles.quizQuestionIndex}>{index + 1}</Text>
              <Text style={styles.quizQuestionText}>{question}</Text>
            </View>
          ))}
        </View>
        <View style={styles.inlineActions}>
          <Button label="إرسال للفصل" compact />
          <Button label="معاينة الطالب" compact secondary />
        </View>
      </Card>

      <SectionTitle title="أوراق العمل والاختبارات" actionLabel="رفع ملف" />
      {worksheetLibrary.map((item) => (
        <WorksheetRow key={item.title} item={item} />
      ))}

      <SectionTitle title="حالة التسليم" actionLabel="كشف الدرجات" />
      <Card style={styles.submissionCard}>
        {submissionStatus.map((student) => (
          <SubmissionRow key={student.name} student={student} />
        ))}
      </Card>
    </ScrollView>
  );
}

export function ScheduleScreen() {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Card>
        <SectionTitle title="توزيع المنهج" actionLabel="إعادة الجدولة" />
        <Text style={styles.screenLead}>
          إذا تغيّر الأسبوع بسبب إجازة أو تعليق، نعيد توزيع الوحدات تلقائياً على الأسابيع المتبقية.
        </Text>
        <View style={styles.scheduleBars}>
          <WeekBar label="الأسبوع 1" value={100} />
          <WeekBar label="الأسبوع 2" value={74} />
          <WeekBar label="الأسبوع 3" value={52} />
          <WeekBar label="الأسبوع 4" value={18} />
        </View>
      </Card>

      <SectionTitle title="محرك ذكي" />
      <Card>
        <Text style={styles.smartTitle}>تعليق دراسي؟ لا مشكلة.</Text>
        <Text style={styles.screenLead}>
          بضغطة واحدة، يوازن النظام الخطة ويقترح حصص التعويض والمواءمة مع الجدول الأسبوعي.
        </Text>
        <View style={styles.inlineActions}>
          <Button label="توزيع مرن" />
          <Button label="عرض الجدول" secondary />
        </View>
      </Card>
    </ScrollView>
  );
}

export function ReportsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Card style={styles.reportHero}>
        <SectionTitle title="التقارير والتصدير" actionLabel="تصدير PDF" />
        <Text style={styles.reportHeadline}>تقرير الفصل جاهز مع ملخص سريع</Text>
        <Text style={styles.screenLead}>
          استخرج كشوف الأداء والغياب والمشاركة مباشرة إلى ملفات قابلة للمشاركة.
        </Text>
        <ProgressBar value={91} accent="primary" />
      </Card>

      <SectionTitle title="مخرجات جاهزة" />
      {['كشف الدرجات', 'حضور الطلاب', 'مشاركة الفصل', 'أعمال السنة'].map((item) => (
        <Card key={item} style={styles.reportItem}>
          <View style={styles.fileRow}>
            <Text style={styles.fileTitle}>{item}</Text>
            <Button label="تصدير" compact />
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

export function StudentProfileScreen() {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Card style={styles.profileHero}>
        <View style={styles.profileTop}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>م</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>الطالب محمد خالد</Text>
            <Text style={styles.profileMeta}>الصف الثالث - 3A</Text>
            <Pill label="ملف نشط" tone="teal" />
          </View>
        </View>

        <View style={styles.heroStats}>
          <StatCard label="نسبة الحضور" value="95%" accent="teal" />
          <StatCard label="التأخر" value="14+" accent="amber" />
        </View>
      </Card>

      <SectionTitle title="ملخص الطالب" />
      <Card>
        <Text style={styles.screenLead}>
          آخر الأنشطة، التواصل مع ولي الأمر، وقراءة سريعة عن الأداء في مكان واحد.
        </Text>
        <GhostDivider />
        <View style={styles.contactRow}>
          <ContactTile label="التقرير" />
          <ContactTile label="رسالة" />
          <ContactTile label="اتصال" />
        </View>
      </Card>
    </ScrollView>
  );
}

function QuickAction({
  title,
  tone,
  onPress,
}: {
  title: string;
  meta: string;
  tone: 'primary' | 'teal' | 'amber' | 'rose';
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.quickAction}>
      <MaterialCommunityIcons
        name={quickIconByTone[tone]}
        size={22}
        color={quickColorByTone[tone]}
      />
      <Text style={styles.quickActionText}>{title}</Text>
    </Pressable>
  );
}

function ClassRow({
  item,
  onJumpTo,
}: {
  item: (typeof todayClasses)[number];
  onJumpTo: (key: string) => void;
}) {
  const target = item.prepStatus === 'يحتاج تحضير' ? 'prep' : item.action.includes('واجب') ? 'content' : 'attendance';

  return (
    <Card style={styles.lessonCard}>
      <View style={styles.lessonRow}>
        <View style={styles.lessonTimeBox}>
          <Text style={styles.lessonTime}>{item.time}</Text>
        </View>
        <View style={styles.lessonBody}>
          <View style={styles.lessonTopLine}>
            <Pill label={item.prepStatus} tone={item.tone} />
            <Text style={styles.lessonTitle}>{item.subject} · {item.grade}</Text>
          </View>
          <Text style={styles.lessonStatus}>{item.lesson} · {item.room}</Text>
          <ProgressBar value={item.progress} accent={item.tone} />
        </View>
        <Pressable style={styles.iconAction} onPress={() => onJumpTo(target)}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.primary} />
        </Pressable>
      </View>
    </Card>
  );
}

function TaskRow({
  task,
  onJumpTo,
}: {
  task: (typeof priorityTasks)[number];
  onJumpTo: (key: string) => void;
}) {
  return (
    <Pressable style={styles.taskRow} onPress={() => onJumpTo(task.target)}>
      <View style={[styles.taskMarker, quickToneStyles[task.tone]]} />
      <View style={styles.taskRowBody}>
        <Text style={styles.taskRowTitle}>{task.title}</Text>
        <Text style={styles.taskRowMeta}>{task.meta}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-left" size={22} color={theme.colors.muted} />
    </Pressable>
  );
}

function WeekBar({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.weekBar}>
      <View style={styles.weekBarHeader}>
        <Text style={styles.weekBarLabel}>{label}</Text>
        <Text style={styles.weekBarValue}>{value}%</Text>
      </View>
      <ProgressBar value={value} accent={value > 70 ? 'teal' : value > 35 ? 'amber' : 'rose'} />
    </View>
  );
}

function ContactTile({ label }: { label: string }) {
  return (
    <Pressable style={styles.contactTile}>
      <Text style={styles.contactText}>{label}</Text>
    </Pressable>
  );
}

const quickToneStyles = StyleSheet.create({
  primary: { backgroundColor: theme.colors.primarySoft },
  teal: { backgroundColor: theme.colors.tealSoft },
  amber: { backgroundColor: theme.colors.amberSoft },
  rose: { backgroundColor: theme.colors.roseSoft },
});

const quickColorByTone = {
  primary: theme.colors.primary,
  teal: theme.colors.teal,
  amber: theme.colors.amber,
  rose: theme.colors.rose,
};

const quickIconByTone = {
  primary: 'book-edit-outline',
  teal: 'account-check-outline',
  amber: 'file-document-edit-outline',
  rose: 'file-chart-outline',
} as const;

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 24,
    gap: 12,
  },
  platformPage: {
    flex: 1,
    backgroundColor: '#E6F7F5',
  },
  platformTopBar: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 4,
  },
  platformIconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  platformTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  platformContent: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#D5F1EE',
  },
  browserAddressBar: {
    minHeight: 48,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  browserAddressText: {
    flex: 1,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'left',
  },
  platformIframe: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  platformNativePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  platformPlaceholderTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  platformPlaceholderText: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center',
  },
  extensionModePanel: {
    flex: 1,
    padding: 14,
    gap: 10,
    justifyContent: 'center',
  },
  extensionModeHero: {
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.primary,
    padding: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  extensionModeCopy: {
    flex: 1,
    alignItems: 'flex-end',
  },
  extensionModeTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'right',
  },
  extensionModeText: {
    color: '#D9E8FF',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 19,
    textAlign: 'right',
    marginTop: 5,
  },
  extensionStepRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 12,
  },
  extensionStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primarySoft,
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 28,
    textAlign: 'center',
  },
  extensionStepText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 19,
    textAlign: 'right',
  },
  extensionActions: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  extensionHintStrip: {
    position: 'absolute',
    top: 58,
    left: 12,
    right: 12,
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: theme.colors.primarySoft,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    padding: 10,
  },
  extensionHintText: {
    flex: 1,
    color: theme.colors.primaryDeep,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'right',
  },
  platformFallbackCard: {
    position: 'absolute',
    top: 76,
    left: 18,
    right: 18,
    borderRadius: theme.radius.xl,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 16,
    alignItems: 'center',
    gap: 10,
  },
  platformFallbackTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  platformFallbackText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'center',
  },
  platformAssistantCard: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 14,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 12,
    gap: 10,
  },
  platformAssistantHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  platformAssistantTitle: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'right',
  },
  platformAssistantText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'right',
  },
  platformAssistantActions: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  todayPanel: {
    backgroundColor: theme.colors.primaryDeep,
    borderRadius: theme.radius.xl,
    padding: 16,
    gap: 16,
  },
  todayHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  todayCopy: {
    flex: 1,
    alignItems: 'flex-end',
  },
  eyebrow: {
    color: '#BFD6FF',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
  },
  todayTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'right',
    marginTop: 4,
  },
  todayMeta: {
    color: '#D9E8FF',
    fontSize: 13,
    textAlign: 'right',
    marginTop: 6,
  },
  timeBlock: {
    width: 72,
    minHeight: 64,
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeBlockValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  timeBlockLabel: {
    color: '#BFD6FF',
    fontSize: 11,
    marginTop: 2,
  },
  todayActions: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  summaryGrid: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  heroStats: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  lessonCard: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  lessonRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  lessonTimeBox: {
    width: 56,
    minHeight: 56,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonTime: {
    color: theme.colors.primary,
    fontWeight: '900',
    fontSize: 15,
    textAlign: 'center',
  },
  lessonBody: {
    flex: 1,
    gap: 7,
  },
  lessonTopLine: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  lessonTitle: {
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: 14,
    textAlign: 'right',
  },
  lessonStatus: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    textAlign: 'right',
  },
  iconAction: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskRow: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.md,
    padding: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  taskMarker: {
    width: 8,
    alignSelf: 'stretch',
    borderRadius: theme.radius.sm,
  },
  taskRowBody: {
    flex: 1,
    alignItems: 'flex-end',
  },
  taskRowTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  taskRowMeta: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: 3,
    textAlign: 'right',
  },
  quickGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAction: {
    width: '31.8%',
    minHeight: 62,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    gap: 5,
  },
  quickActionText: {
    color: theme.colors.text,
    fontWeight: '900',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },
  quickActionMeta: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
  screenLead: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'right',
  },
  prepHero: {
    backgroundColor: theme.colors.primaryDeep,
    borderRadius: theme.radius.xl,
    padding: 16,
    gap: 14,
  },
  prepHeroTop: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  prepHeroCopy: {
    flex: 1,
    alignItems: 'flex-end',
  },
  prepHeroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'right',
    marginTop: 4,
  },
  prepHeroMeta: {
    color: '#D9E8FF',
    fontSize: 13,
    textAlign: 'right',
    marginTop: 6,
  },
  aiScore: {
    width: 76,
    minHeight: 70,
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiScoreValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  aiScoreLabel: {
    color: '#BFD6FF',
    fontSize: 11,
    marginTop: 2,
  },
  prepModeGrid: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  prepModeButton: {
    flex: 1,
    minHeight: 62,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  prepModeButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  prepModeCopy: {
    alignItems: 'center',
  },
  prepModeTitle: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  prepModeTitleActive: {
    color: '#FFFFFF',
  },
  prepModeMeta: {
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 2,
  },
  prepModeMetaActive: {
    color: '#D9E8FF',
  },
  prepDetailsPanel: {
    gap: 12,
  },
  metaGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  lessonSelector: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  lessonOption: {
    flex: 1,
    minHeight: 78,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  lessonOptionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryDeep,
  },
  lessonOptionTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'right',
    lineHeight: 18,
  },
  lessonOptionTitleActive: {
    color: '#FFFFFF',
  },
  lessonOptionMeta: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
    textAlign: 'right',
  },
  lessonOptionMetaActive: {
    color: '#D9E8FF',
  },
  metaTile: {
    width: '48.5%',
    minHeight: 72,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.md,
    padding: 12,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  metaTileLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right',
  },
  metaTileValue: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
    marginTop: 5,
    lineHeight: 18,
  },
  prepSectionCard: {
    paddingVertical: 14,
    gap: 12,
  },
  prepSectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  prepSectionTitleWrap: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  editMiniButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  editMiniText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  sectionItems: {
    gap: 9,
  },
  sectionItem: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  sectionItemText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'right',
  },
  assignmentCard: {
    gap: 14,
  },
  assignmentHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  assignmentTitle: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'right',
  },
  assignmentStats: {
    gap: 8,
  },
  infoChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  infoChipText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
  prepActionGrid: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  prepActionButton: {
    flex: 1,
    minHeight: 68,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  prepActionText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  distributionTool: {
    gap: 12,
  },
  distributionHeader: {
    backgroundColor: '#0B4D47',
    borderRadius: theme.radius.xl,
    padding: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  distributionTitleWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  distributionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'right',
    marginTop: 4,
    lineHeight: 27,
  },
  distributionMeta: {
    color: '#CDEFE8',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: 6,
  },
  distributionBadge: {
    width: 70,
    minHeight: 66,
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  distributionBadgeValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  distributionBadgeLabel: {
    color: '#CDEFE8',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  distributionStats: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  distributionFilters: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  distributionFilter: {
    flex: 1,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    padding: 10,
    alignItems: 'flex-end',
  },
  distributionFilterLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right',
  },
  distributionFilterValue: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'right',
    marginTop: 4,
  },
  distributionActions: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  rescheduleNotice: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.tealSoft,
    backgroundColor: theme.colors.tealSoft,
    padding: 11,
  },
  rescheduleNoticeText: {
    flex: 1,
    color: theme.colors.teal,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
    lineHeight: 18,
  },
  distributionWeek: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    padding: 12,
    gap: 10,
  },
  distributionWeekHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  distributionWeekCopy: {
    flex: 1,
    alignItems: 'flex-end',
  },
  distributionWeekTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'right',
  },
  distributionWeekMeta: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: 3,
  },
  distributionLessonRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 11,
  },
  distributionLessonRowActive: {
    borderColor: theme.colors.teal,
    backgroundColor: theme.colors.tealSoft,
  },
  distributionLessonBody: {
    flex: 1,
    alignItems: 'flex-end',
  },
  distributionLessonTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'right',
    lineHeight: 19,
  },
  distributionLessonTitleActive: {
    color: theme.colors.teal,
  },
  distributionLessonMeta: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: 3,
  },
  madrastiPanel: {
    gap: 12,
    marginTop: 8,
  },
  madrastiHeader: {
    backgroundColor: '#123B2F',
    borderRadius: theme.radius.xl,
    padding: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  madrastiTitleWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  madrastiTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'right',
    marginTop: 4,
  },
  madrastiMeta: {
    color: '#D7F4EA',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: 6,
  },
  madrastiBadge: {
    width: 66,
    minHeight: 66,
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  madrastiBadgeValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  madrastiBadgeLabel: {
    color: '#D7F4EA',
    fontSize: 11,
    fontWeight: '800',
  },
  classTypeGrid: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  classTypeButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  classTypeButtonActive: {
    borderColor: theme.colors.teal,
    backgroundColor: theme.colors.tealSoft,
  },
  classTypeText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  classTypeTextActive: {
    color: theme.colors.teal,
  },
  madrastiActionRow: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  madrastiStatusCard: {
    gap: 12,
  },
  madrastiStatusRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  madrastiStatusCopy: {
    flex: 1,
    alignItems: 'flex-end',
  },
  madrastiStatusTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'right',
  },
  madrastiStatusText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'right',
  },
  madrastiBridgeRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySoft,
    padding: 10,
  },
  madrastiBridgeText: {
    flex: 1,
    color: theme.colors.primaryDeep,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'right',
  },
  generationGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  generationStep: {
    width: '31.8%',
    minHeight: 76,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 9,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  generationStepTitle: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'right',
    lineHeight: 16,
  },
  generationStepStatus: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right',
  },
  madrastiFieldCard: {
    gap: 10,
  },
  madrastiFieldHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  madrastiFieldTitle: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'right',
  },
  madrastiFieldText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 21,
    textAlign: 'right',
  },
  madrastiFieldInput: {
    minHeight: 92,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primarySoft,
    backgroundColor: theme.colors.surfaceAlt,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 21,
    padding: 12,
    textAlignVertical: 'top',
  },
  madrastiFieldActions: {
    gap: 9,
    alignItems: 'flex-end',
  },
  madrastiMoreButton: {
    minHeight: 46,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primarySoft,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  madrastiMoreText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  madrastiMiniActions: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  madrastiMiniAction: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  madrastiMiniActionText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  madrastiCompactRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.md,
    padding: 12,
  },
  madrastiCompactBody: {
    flex: 1,
    alignItems: 'flex-end',
  },
  madrastiCompactTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'right',
  },
  madrastiCompactMeta: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
    textAlign: 'right',
  },
  activityHero: {
    backgroundColor: theme.colors.primaryDeep,
    borderRadius: theme.radius.xl,
    padding: 16,
    gap: 14,
  },
  activityHeroCopy: {
    alignItems: 'flex-end',
  },
  activityHeroTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'right',
    lineHeight: 28,
    marginTop: 4,
  },
  activityHeroMeta: {
    color: '#D9E8FF',
    fontSize: 13,
    textAlign: 'right',
    marginTop: 6,
  },
  quizQuestionList: {
    gap: 8,
  },
  quizQuestion: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.sm,
    padding: 10,
  },
  quizQuestionIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.primarySoft,
    color: theme.colors.primary,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '900',
  },
  quizQuestionText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
    lineHeight: 19,
  },
  worksheetCard: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  worksheetRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  worksheetIcon: {
    width: 46,
    height: 46,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  worksheetBody: {
    flex: 1,
    alignItems: 'flex-end',
  },
  worksheetTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'right',
  },
  worksheetMeta: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
    textAlign: 'right',
  },
  worksheetStatus: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 5,
    textAlign: 'right',
  },
  submissionCard: {
    gap: 0,
  },
  submissionRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  submissionBody: {
    flex: 1,
    alignItems: 'flex-end',
  },
  submissionName: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  submissionScore: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: 3,
    textAlign: 'right',
  },
  attendancePanel: {
    backgroundColor: theme.colors.primaryDeep,
    borderRadius: theme.radius.xl,
    padding: 16,
    gap: 13,
  },
  attendancePanelTop: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  attendanceCopy: {
    flex: 1,
    alignItems: 'flex-end',
  },
  attendanceTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'right',
    marginTop: 4,
  },
  attendanceMeta: {
    color: '#D9E8FF',
    fontSize: 13,
    textAlign: 'right',
    marginTop: 6,
  },
  quickMarkGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickMarkButton: {
    width: '48.5%',
    minHeight: 62,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  quickMarkText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  attendanceStudentCard: {
    paddingBottom: 14,
    gap: 10,
  },
  studentSignals: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  studentNote: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.sm,
    padding: 10,
  },
  studentNoteText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'right',
  },
  inputBlock: {
    marginTop: 10,
    gap: 8,
  },
  inputLabel: {
    color: theme.colors.muted,
    fontWeight: '700',
    textAlign: 'right',
  },
  fakeInput: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surfaceAlt,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  fakeInputText: {
    color: theme.colors.text,
    fontWeight: '700',
    textAlign: 'right',
  },
  aiBanner: {
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  aiBannerText: {
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
  },
  fieldCard: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 14,
    gap: 10,
  },
  fieldHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldTitle: {
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: 14,
    textAlign: 'right',
  },
  fieldText: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'right',
  },
  inlineActions: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginTop: 12,
  },
  taskCard: {
    marginTop: 10,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 18,
    padding: 14,
    gap: 8,
  },
  taskTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'right',
  },
  taskText: {
    color: theme.colors.muted,
    fontSize: 13,
    textAlign: 'right',
    lineHeight: 20,
  },
  attendanceHero: {
    gap: 12,
  },
  progressText: {
    color: theme.colors.muted,
    fontSize: 12,
    textAlign: 'right',
  },
  emptyHero: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 26,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontWeight: '900',
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 28,
  },
  fileCard: {
    paddingVertical: 12,
  },
  fileRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileMeta: {
    flex: 1,
    marginRight: 10,
  },
  fileTitle: {
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: 14,
    textAlign: 'right',
  },
  fileType: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  scheduleBars: {
    gap: 12,
    marginTop: 8,
  },
  weekBar: {
    gap: 8,
  },
  weekBarHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  weekBarLabel: {
    color: theme.colors.text,
    fontWeight: '700',
    textAlign: 'right',
  },
  weekBarValue: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  smartTitle: {
    color: theme.colors.text,
    fontWeight: '900',
    fontSize: 18,
    textAlign: 'right',
    marginBottom: 6,
  },
  reportHero: {
    gap: 12,
  },
  reportHeadline: {
    color: theme.colors.text,
    fontWeight: '900',
    fontSize: 18,
    textAlign: 'right',
  },
  reportItem: {
    paddingVertical: 12,
  },
  profileHero: {
    gap: 18,
  },
  profileTop: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 14,
  },
  profileAvatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: theme.colors.primary,
    fontSize: 26,
    fontWeight: '900',
  },
  profileInfo: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 6,
  },
  profileName: {
    color: theme.colors.text,
    fontWeight: '900',
    fontSize: 18,
    textAlign: 'right',
  },
  profileMeta: {
    color: theme.colors.muted,
    fontSize: 12,
    textAlign: 'right',
  },
  contactRow: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  contactTile: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceAlt,
  },
  contactText: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
});
