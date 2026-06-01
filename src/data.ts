export const teacherProfile = {
  name: 'أ. أحمد العتيبي',
  school: 'مدرسة اليرموك الابتدائية',
  dateLabel: 'الأحد 18 شعبان',
  nextClass: 'الرياضيات - الصف الثاني',
};

export const daySummary = [
  { label: 'التحاضير', value: '5/6', tone: 'primary' as const },
  { label: 'الحضور', value: '3/6', tone: 'teal' as const },
  { label: 'مهام عاجلة', value: '4', tone: 'amber' as const },
];

export const todayClasses = [
  {
    id: 'science-3a',
    time: '07:00',
    subject: 'العلوم',
    grade: 'الثالث - أ',
    lesson: 'دورة حياة النبات',
    room: 'معمل العلوم',
    prepStatus: 'جاهز',
    action: 'بدء الحصة',
    progress: 100,
    tone: 'teal' as const,
  },
  {
    id: 'math-2b',
    time: '08:15',
    subject: 'الرياضيات',
    grade: 'الثاني - ب',
    lesson: 'الجمع ضمن 100',
    room: 'فصل 2B',
    prepStatus: 'يحتاج واجب',
    action: 'اقتراح واجب',
    progress: 72,
    tone: 'amber' as const,
  },
  {
    id: 'arabic-4a',
    time: '09:40',
    subject: 'لغتي',
    grade: 'الرابع - أ',
    lesson: 'الفهم القرائي',
    room: 'فصل 4A',
    prepStatus: 'يحتاج تحضير',
    action: 'تحضير الآن',
    progress: 24,
    tone: 'rose' as const,
  },
  {
    id: 'activity-3a',
    time: '11:10',
    subject: 'نشاط',
    grade: 'الثالث - أ',
    lesson: 'لعبة تعليمية تفاعلية',
    room: 'مصادر التعلم',
    prepStatus: 'مقترح',
    action: 'اختيار لعبة',
    progress: 55,
    tone: 'primary' as const,
  },
];

export const priorityTasks = [
  {
    title: 'تحضير درس الفهم القرائي',
    meta: 'لغتي - الرابع أ',
    target: 'prep',
    tone: 'rose' as const,
  },
  {
    title: 'رصد غياب الحصة الثانية',
    meta: 'الرياضيات - الثاني ب',
    target: 'attendance',
    tone: 'amber' as const,
  },
  {
    title: 'تقرير واجبات الأسبوع',
    meta: 'جاهز للتصدير',
    target: 'reports',
    tone: 'primary' as const,
  },
];

export const quickActions = [
  { title: 'التحضير', meta: 'درس جديد', target: 'prep', tone: 'primary' as const },
  { title: 'الحضور', meta: 'حضور ومشاركة', target: 'attendance', tone: 'teal' as const },
  { title: 'المحتوى', meta: 'اختبار أو PDF', target: 'content', tone: 'amber' as const },
  { title: 'المنهج', meta: 'توزيع أسبوعي', target: 'schedule', tone: 'primary' as const },
  { title: 'التقارير', meta: 'كشف أو ملف إنجاز', target: 'reports', tone: 'rose' as const },
];

export const prepWizard = {
  stage: 'المرحلة الابتدائية',
  grade: 'الصف الثاني',
  subject: 'الرياضيات',
  term: 'الفصل الدراسي الثاني',
  unit: 'الوحدة الخامسة: الأعداد والعمليات',
  lesson: 'الجمع ضمن 100',
  className: 'الثاني - ب',
  duration: '45 دقيقة',
};

export const prepMeta = [
  { label: 'المرحلة', value: prepWizard.stage },
  { label: 'الصف', value: prepWizard.grade },
  { label: 'المادة', value: prepWizard.subject },
  { label: 'الفصل', value: prepWizard.term },
  { label: 'الوحدة', value: prepWizard.unit },
  { label: 'مدة الحصة', value: prepWizard.duration },
];

export const generatedPrepSections = [
  {
    title: 'الأهداف',
    tone: 'primary' as const,
    items: [
      'أن يجمع الطالب عددين ضمن 100 باستخدام إعادة التجميع عند الحاجة.',
      'أن يفسر الطالب خطوات الحل شفهياً أو كتابياً.',
      'أن يطبق المهارة في مسائل حياتية قصيرة.',
    ],
  },
  {
    title: 'التمهيد',
    tone: 'teal' as const,
    items: [
      'عرض مسألة يومية عن جمع نقاط فريقين في لعبة صفية.',
      'مراجعة سريعة للجمع ضمن 20 قبل الانتقال إلى 100.',
    ],
  },
  {
    title: 'الاستراتيجيات',
    tone: 'amber' as const,
    items: [
      'تعلم تعاوني في أزواج.',
      'نمذجة الحل على لوحة القيمة المنزلية.',
      'تفكير بصوت عال لتوضيح خطوات إعادة التجميع.',
    ],
  },
  {
    title: 'الوسائل التعليمية',
    tone: 'primary' as const,
    items: [
      'بطاقات آحاد وعشرات.',
      'سبورة تفاعلية أو عرض قصير.',
      'ورقة عمل مصغرة للتقويم السريع.',
    ],
  },
  {
    title: 'التقويم والإغلاق',
    tone: 'rose' as const,
    items: [
      'سؤال خروج من مسألتين: واحدة مباشرة وواحدة لفظية.',
      'مراجعة خطأ شائع في ترتيب الآحاد والعشرات.',
    ],
  },
];

export const suggestedAssignment = {
  title: 'واجب تفاعلي: الجمع ضمن 100',
  questions: '5 أسئلة قصيرة',
  time: '7 دقائق',
  grading: 'تصحيح تلقائي',
  linkedTo: 'كشف المتابعة وأعمال السنة',
};

export const prepActions = [
  { label: 'حفظ التحضير', icon: 'content-save-outline' },
  { label: 'نسخ لفصل آخر', icon: 'content-copy' },
  { label: 'طباعة / تصدير', icon: 'printer-outline' },
];

export const prepLessonOptions = [
  {
    id: 'math-addition-100',
    stage: 'المرحلة الابتدائية',
    grade: 'الصف الثاني',
    subject: 'الرياضيات',
    term: 'الفصل الدراسي الثاني',
    unit: 'الوحدة الخامسة: الأعداد والعمليات',
    lesson: 'الجمع ضمن 100',
    className: 'الثاني - ب',
    duration: '45 دقيقة',
    readiness: '92%',
    sections: generatedPrepSections,
    assignment: suggestedAssignment,
  },
  {
    id: 'arabic-reading',
    stage: 'المرحلة الابتدائية',
    grade: 'الصف الرابع',
    subject: 'لغتي',
    term: 'الفصل الدراسي الثاني',
    unit: 'الوحدة الرابعة: صحتي وبيئتي',
    lesson: 'الفهم القرائي',
    className: 'الرابع - أ',
    duration: '45 دقيقة',
    readiness: '88%',
    sections: [
      {
        title: 'الأهداف',
        tone: 'primary' as const,
        items: [
          'أن يحدد الطالب الفكرة الرئيسة في النص.',
          'أن يستنتج معاني المفردات من السياق.',
          'أن يجيب عن أسئلة فهم مباشرة واستنتاجية.',
        ],
      },
      {
        title: 'التمهيد',
        tone: 'teal' as const,
        items: [
          'عرض صورة مرتبطة بموضوع النص وطرح سؤال توقعي.',
          'قراءة عنوان النص ومناقشة ما يتوقعه الطلاب.',
        ],
      },
      {
        title: 'الاستراتيجيات',
        tone: 'amber' as const,
        items: [
          'القراءة الموجهة.',
          'فكر، زاوج، شارك.',
          'تظليل الأدلة من النص قبل الإجابة.',
        ],
      },
      {
        title: 'الوسائل التعليمية',
        tone: 'primary' as const,
        items: [
          'نص مقروء على الشاشة.',
          'بطاقات مفردات.',
          'منظم بصري للفكرة الرئيسة والتفاصيل.',
        ],
      },
      {
        title: 'التقويم والإغلاق',
        tone: 'rose' as const,
        items: [
          'سؤال خروج: اكتب الفكرة الرئيسة في جملة واحدة.',
          'مشاركة إجابتين ومناقشة الدليل من النص.',
        ],
      },
    ],
    assignment: {
      title: 'واجب تفاعلي: فهم النص',
      questions: '4 أسئلة فهم',
      time: '6 دقائق',
      grading: 'تصحيح تلقائي',
      linkedTo: 'كشف القراءة والمشاركة',
    },
  },
  {
    id: 'science-plant-cycle',
    stage: 'المرحلة الابتدائية',
    grade: 'الصف الثالث',
    subject: 'العلوم',
    term: 'الفصل الدراسي الثاني',
    unit: 'الوحدة الثالثة: النباتات',
    lesson: 'دورة حياة النبات',
    className: 'الثالث - أ',
    duration: '45 دقيقة',
    readiness: '95%',
    sections: [
      {
        title: 'الأهداف',
        tone: 'primary' as const,
        items: [
          'أن يرتب الطالب مراحل دورة حياة النبات.',
          'أن يصف وظيفة البذرة والجذر والساق والورقة.',
          'أن يربط احتياجات النبات بنموه.',
        ],
      },
      {
        title: 'التمهيد',
        tone: 'teal' as const,
        items: [
          'عرض نبتة حقيقية أو صورة لنبتة في مراحل مختلفة.',
          'سؤال افتتاحي: ماذا تحتاج البذرة حتى تصبح نباتاً؟',
        ],
      },
      {
        title: 'الاستراتيجيات',
        tone: 'amber' as const,
        items: [
          'تعلم بالاكتشاف.',
          'ترتيب بطاقات المراحل.',
          'مناقشة جماعية قصيرة بعد النشاط.',
        ],
      },
      {
        title: 'الوسائل التعليمية',
        tone: 'primary' as const,
        items: [
          'بطاقات دورة الحياة.',
          'فيديو قصير لنمو النبات.',
          'ورقة عمل ترتيب وتسميات.',
        ],
      },
      {
        title: 'التقويم والإغلاق',
        tone: 'rose' as const,
        items: [
          'نشاط خروج: رتب أربع صور لدورة حياة النبات.',
          'سؤال شفهي: ماذا يحدث إذا لم يحصل النبات على الماء؟',
        ],
      },
    ],
    assignment: {
      title: 'واجب تفاعلي: دورة حياة النبات',
      questions: '5 أسئلة مصورة',
      time: '8 دقائق',
      grading: 'تصحيح تلقائي',
      linkedTo: 'كشف العلوم والمهارات',
    },
  },
];

export const activitySummary = [
  { label: 'واجبات نشطة', value: '3', tone: 'primary' as const },
  { label: 'بانتظار التصحيح', value: '7', tone: 'amber' as const },
  { label: 'مكتمل', value: '82%', tone: 'teal' as const },
];

export const linkedAssignment = {
  title: 'واجب الجمع ضمن 100',
  lesson: 'الرياضيات · الصف الثاني',
  status: 'جاهز للإرسال',
  dueDate: 'اليوم 9:00 مساءً',
  questions: [
    '٣٥ + ٢٧ = ؟',
    'اكتب مسألة حياتية يكون ناتجها ٦٤.',
    'اختر الطريقة الصحيحة لإعادة التجميع.',
  ],
};

export const worksheetLibrary = [
  {
    title: 'ورقة عمل الجمع ضمن 100',
    type: 'PDF تفاعلي',
    lesson: 'الرياضيات · الصف الثاني',
    status: 'قابل للتحويل إلى كويز',
    tone: 'primary' as const,
  },
  {
    title: 'اختبار فهم النص',
    type: 'كويز سريع',
    lesson: 'لغتي · الصف الرابع',
    status: 'تصحيح تلقائي',
    tone: 'teal' as const,
  },
  {
    title: 'دورة حياة النبات',
    type: 'نشاط مصور',
    lesson: 'العلوم · الصف الثالث',
    status: 'مرتبط بالمهارات',
    tone: 'amber' as const,
  },
];

export const submissionStatus = [
  { name: 'أحمد خالد', status: 'سلّم', score: '5/5', tone: 'teal' as const },
  { name: 'سارة محمد', status: 'قيد الحل', score: '--', tone: 'amber' as const },
  { name: 'خالد يوسف', status: 'لم يفتح', score: '--', tone: 'rose' as const },
  { name: 'ريم عبدالله', status: 'سلّمت', score: '4/5', tone: 'teal' as const },
];

export const attendanceSession = {
  className: 'الثاني - ب',
  subject: 'الرياضيات',
  lesson: 'الجمع ضمن 100',
  time: '08:15',
  syncState: 'محفوظ محلياً',
};

export const attendanceSummary = [
  { label: 'حاضر', value: '24', tone: 'teal' as const },
  { label: 'غائب', value: '2', tone: 'rose' as const },
  { label: 'مشارك', value: '11', tone: 'primary' as const },
];

export const attendanceStudents = [
  {
    name: 'أحمد خالد',
    role: 'الثاني - ب',
    avatar: 'أح',
    attendance: 'حاضر',
    participation: 'مشارك',
    homework: 'مكتمل',
    note: 'حل المسألة اللفظية أمام المجموعة.',
    tone: 'teal' as const,
  },
  {
    name: 'سارة محمد',
    role: 'الثاني - ب',
    avatar: 'سـ',
    attendance: 'حاضر',
    participation: 'متابعة',
    homework: 'قيد الحل',
    note: 'تحتاج تدريباً على إعادة التجميع.',
    tone: 'amber' as const,
  },
  {
    name: 'خالد يوسف',
    role: 'الثاني - ب',
    avatar: 'خـ',
    attendance: 'غائب',
    participation: 'لم يرصد',
    homework: 'لم يفتح',
    note: 'تظهر في تقرير الغياب اليومي.',
    tone: 'rose' as const,
  },
  {
    name: 'ريم عبدالله',
    role: 'الثاني - ب',
    avatar: 'رع',
    attendance: 'حاضر',
    participation: 'مشاركة عالية',
    homework: 'مكتمل',
    note: 'أجابت بدقة على سؤال الخروج.',
    tone: 'teal' as const,
  },
];

export const attendanceQuickMarks = [
  { label: 'حاضر', icon: 'check-circle-outline', tone: 'teal' as const },
  { label: 'غائب', icon: 'close-circle-outline', tone: 'rose' as const },
  { label: 'مشارك', icon: 'hand-back-right-outline', tone: 'primary' as const },
  { label: 'تأخر', icon: 'clock-alert-outline', tone: 'amber' as const },
];

export const madrastiPrepRequest = {
  subject: 'الرياضيات',
  grade: 'الصف الثاني',
  unit: 'الوحدة الخامسة: الأعداد والعمليات',
  lesson: 'الجمع ضمن 100',
  classType: 'حضوري',
  date: 'الأحد 18 شعبان',
};

export const madrastiClassTypes = [
  { label: 'حضوري', tone: 'primary' as const },
  { label: 'عن بعد', tone: 'teal' as const },
  { label: 'علاجية', tone: 'amber' as const },
  { label: 'إثرائية', tone: 'rose' as const },
];

export const madrastiPrepFields = [
  {
    key: 'outcomes',
    title: 'نواتج التعلم',
    quality: 'مناسب',
    text: 'أن يجمع الطالب عددين ضمن 100 ويفسر خطوات الحل باستخدام القيمة المنزلية.',
  },
  {
    key: 'goals',
    title: 'الأهداف',
    quality: 'مناسب',
    text: 'يميز الطالب الآحاد والعشرات، يطبق الجمع بإعادة التجميع، ويحل مسألة لفظية قصيرة.',
  },
  {
    key: 'warmup',
    title: 'التهيئة',
    quality: 'مناسب',
    text: 'عرض موقف حياتي عن جمع نقاط فريقين، ثم سؤال الطلاب عن طريقة الوصول للناتج.',
  },
  {
    key: 'vocabulary',
    title: 'المفردات',
    quality: 'يحتاج مراجعة',
    text: 'آحاد، عشرات، إعادة التجميع، ناتج الجمع، مسألة لفظية.',
  },
  {
    key: 'strategies',
    title: 'الاستراتيجيات',
    quality: 'مناسب',
    text: 'تعلم تعاوني، نمذجة الحل، التفكير بصوت عال، سؤال خروج فردي.',
  },
  {
    key: 'resources',
    title: 'الوسائل التعليمية',
    quality: 'مناسب',
    text: 'بطاقات آحاد وعشرات، سبورة تفاعلية، ورقة عمل قصيرة، عرض بصري.',
  },
  {
    key: 'activities',
    title: 'الأنشطة الصفية',
    quality: 'مناسب',
    text: 'نشاط زوجي لترتيب الأعداد، حل مثال جماعي، ثم تطبيق فردي لمسألتين.',
  },
  {
    key: 'assessment',
    title: 'التقويم',
    quality: 'مناسب',
    text: 'ملاحظة أداء الطلاب أثناء النشاط، سؤال خروج، وتصحيح فوري لسؤالين.',
  },
  {
    key: 'homework',
    title: 'الواجب',
    quality: 'مناسب',
    text: 'واجب تفاعلي من 5 أسئلة عن الجمع ضمن 100 مع تصحيح تلقائي.',
  },
  {
    key: 'closure',
    title: 'الإغلاق',
    quality: 'مناسب',
    text: 'تلخيص خطوات الجمع بإعادة التجميع، وطلب مثال شفهي من طالبين.',
  },
];

export const madrastiGenerationSteps = [
  { title: 'فهم حقول مدرستي', status: 'مكتمل' },
  { title: 'توليد مسودة AI', status: 'مكتمل' },
  { title: 'مراجعة وتعديل سريع', status: 'جاهز' },
  { title: 'نسخ بصيغة مدرستي', status: 'جاهز' },
  { title: 'تحويل نوع الحصة', status: 'جاهز' },
  { title: 'حفظ في بنك التحاضير', status: 'جاهز' },
  { title: 'سجل التصدير', status: 'جاهز' },
  { title: 'مصادقة Microsoft', status: 'لاحقاً' },
  { title: 'مزامنة مدرستي', status: 'لاحقاً' },
];

export const madrastiSavedPreps = [
  { title: 'الجمع ضمن 100', meta: 'الرياضيات · الثاني ب', status: 'تم نسخه' },
  { title: 'الفهم القرائي', meta: 'لغتي · الرابع أ', status: 'مسودة' },
  { title: 'دورة حياة النبات', meta: 'العلوم · الثالث أ', status: 'جاهز' },
];

export const madrastiExportLog = [
  { title: 'نسخ الكل بصيغة مدرستي', time: 'قبل 12 دقيقة', status: 'ناجح' },
  { title: 'نسخ حقل الأهداف', time: 'قبل 18 دقيقة', status: 'ناجح' },
  { title: 'مزامنة مباشرة', time: 'غير مفعلة', status: 'لاحقاً' },
];
