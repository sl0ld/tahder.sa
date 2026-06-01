(function () {
  const assistantId = 'tahder-madrasati-assistant';
  const storageKey = 'tahder-saved-prep';
  const sessionKey = 'tahder-extension-session';

  if (document.getElementById(assistantId)) {
    return;
  }

  const defaultPrep = {
    objectives: 'أن يحدد الطالب الفكرة الرئيسة للدرس، وأن يطبق المهارة في نشاط قصير، وأن يشارك بإجابة شفهية أو كتابية.',
    strategies: 'التعلم التعاوني، فكر زاوج شارك، القراءة الموجهة، سؤال خروج.',
    resources: 'الكتاب المدرسي، سبورة تفاعلية، بطاقة مهارة، ورقة عمل قصيرة.',
    closure: 'تلخيص سريع للمهارة مع سؤال خروج يقيس تحقق الهدف.',
    enrichment: 'رابط إثرائي مرتبط بالدرس من منصة عين، مع نشاط قصير يراعي الفروق الفردية.',
    assignment: 'واجب قصير من أربعة أسئلة مرتبط بمهارة الدرس مع تصحيح تلقائي.',
    hints: 'راجع عنوان الدرس، ثم ركز على الفكرة الرئيسة، واستفد من رابط عين المرفق قبل تنفيذ الواجب.',
    activities: 'نشاط تعاوني قصير: يعمل الطلاب في مجموعات مصغرة لتطبيق المهارة ومشاركة النتيجة.',
  };

  const fieldDefinitions = [
    { key: 'objectives', label: 'الأهداف', hints: ['هدف', 'الأهداف', 'اهداف', 'Objectives'] },
    { key: 'strategies', label: 'الاستراتيجيات', hints: ['استراتيجية', 'استراتيجيات', 'Strategies'] },
    { key: 'resources', label: 'الوسائل', hints: ['وسيلة', 'وسائل', 'مصادر', 'Resources'] },
    { key: 'closure', label: 'الإغلاق والتقويم', hints: ['إغلاق', 'اغلاق', 'تقويم', 'Closure'] },
    { key: 'enrichment', label: 'الإثراءات', hints: ['إثراء', 'اثراء', 'Enrichment'] },
    { key: 'assignment', label: 'الواجب', hints: ['واجب', 'واجبات', 'Assignment'] },
    { key: 'hints', label: 'التلميحات', hints: ['تلميح', 'تلميحات', 'Hints'] },
    { key: 'activities', label: 'الأنشطة المدرسية', hints: ['نشاط', 'أنشطة', 'الأنشطة', 'Activities'] },
  ];

  let activePrep = { ...defaultPrep };
  let session = readSession();

  function readSession() {
    const stored = localStorage.getItem(sessionKey);

    return stored ? JSON.parse(stored) : null;
  }

  function normalize(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function setNativeValue(element, value) {
    const descriptor = Object.getOwnPropertyDescriptor(element.constructor.prototype, 'value');

    if (descriptor && descriptor.set) {
      descriptor.set.call(element, value);
    } else {
      element.value = value;
    }

    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function findFieldByHints(hints) {
    const fields = Array.from(document.querySelectorAll('textarea, input[type="text"], [contenteditable="true"]'));

    return fields.find((field) => {
      const nearby = field.closest('div, label, td, tr, section')?.innerText;
      const haystack = normalize([
        field.getAttribute('aria-label'),
        field.getAttribute('placeholder'),
        field.getAttribute('name'),
        field.getAttribute('id'),
        nearby,
      ].filter(Boolean).join(' '));

      return hints.some((hint) => haystack.includes(hint));
    });
  }

  function fillField(field, value) {
    if (!field) {
      return false;
    }

    if (field.getAttribute('contenteditable') === 'true') {
      field.textContent = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }

    setNativeValue(field, value);
    return true;
  }

  function updateStatus(text, tone = 'ready') {
    const status = document.querySelector(`#${assistantId} .tahder-status`);

    if (!status) {
      return;
    }

    status.textContent = text;
    status.dataset.tone = tone;
  }

  function autofillPrep() {
    const filled = fieldDefinitions.filter((field) =>
      fillField(findFieldByHints(field.hints), activePrep[field.key]),
    );

    updateStatus(`تمت تعبئة ${filled.length} من ${fieldDefinitions.length} حقول`, filled.length ? 'success' : 'warn');
  }

  function savePrep() {
    localStorage.setItem(storageKey, JSON.stringify(activePrep));
    updateStatus('تم حفظ التحضير في البنك المحلي', 'success');
  }

  function importPrep() {
    const saved = localStorage.getItem(storageKey);

    if (!saved) {
      updateStatus('لا يوجد تحضير محفوظ حتى الآن', 'warn');
      return;
    }

    activePrep = { ...activePrep, ...JSON.parse(saved) };
    updateStatus('تم استيراد التحضير المحفوظ', 'success');
  }

  function prepareWeek() {
    updateStatus('تم تجهيز مسودة تحضير حصص الأسبوع', 'success');
  }

  function copyToClasses() {
    updateStatus('تم تجهيز النسخ للفصول المتشابهة', 'success');
  }

  function renderEditorValues() {
    fieldDefinitions.forEach((field) => {
      const input = root.querySelector(`[data-prep-field="${field.key}"]`);

      if (input) {
        input.value = activePrep[field.key];
      }
    });
  }

  function createEditor() {
    return fieldDefinitions.map((field) => `
      <label class="tahder-editor-field">
        <span>${field.label}</span>
        <textarea data-prep-field="${field.key}" rows="3">${activePrep[field.key]}</textarea>
      </label>
    `).join('');
  }

  function detectLessonTitle() {
    const candidates = Array.from(document.querySelectorAll(
      '[data-lesson-title], h1, h2, .lesson-title, [class*="lesson"]',
    ));
    const match = candidates
      .map((element) => normalize(element.textContent))
      .find((text) => text && text.length > 4 && text.length < 140);

    return match || 'الدرس المحدد في مدرستي';
  }

  const root = document.createElement('div');
  root.id = assistantId;
  root.dir = 'rtl';

  function renderAssistant() {
    if (!session) {
      root.innerHTML = `
        <aside class="tahder-toolbar tahder-login-toolbar">
          <header class="tahder-toolbar-header">
            <div class="tahder-brand-row">
              <span class="tahder-brand-mark">ت</span>
              <div>
                <strong>تحضيري</strong>
                <small>سجل الدخول لتفعيل الإضافة</small>
              </div>
            </div>
            <span class="tahder-lock-badge">قفل</span>
          </header>
          <form class="tahder-login-form">
            <label>
              <span>البريد الإلكتروني</span>
              <input name="email" type="email" placeholder="teacher@example.com" required>
            </label>
            <label>
              <span>كلمة المرور</span>
              <input name="password" type="password" placeholder="••••••••" required>
            </label>
            <button class="tahder-primary-action" type="submit">تسجيل الدخول</button>
            <small class="tahder-login-note">نسخة تجريبية: استخدم أي بريد وكلمة مرور.</small>
          </form>
        </aside>
      `;

      return;
    }

    root.innerHTML = `
      <aside class="tahder-toolbar tahder-full-panel">
        <header class="tahder-toolbar-header">
          <div class="tahder-brand-row">
            <span class="tahder-brand-mark">ت</span>
            <div>
              <strong>تحضيري</strong>
              <small>${detectLessonTitle()}</small>
            </div>
          </div>
          <button class="tahder-signout" data-action="signout" type="button">خروج</button>
        </header>

        <div class="tahder-subscription-row">
          <span>${session.email}</span>
          <b>اشتراك فعال</b>
        </div>
        <div class="tahder-status" data-tone="ready">تم اكتشاف صفحة التحضير</div>
        <button class="tahder-primary-action" data-action="autofill" type="button">تعبئة التحضير تلقائياً</button>

        <details class="tahder-section" open>
          <summary>التحضير الشامل <span>+</span></summary>
          <div class="tahder-section-body tahder-grid">
            <button data-action="autofill" type="button">تعبئة الحصة الحالية</button>
            <button data-action="week" type="button">تحضير الأسبوع</button>
            <button data-action="classes" type="button">نسخ للفصول</button>
            <button data-action="save" type="button">حفظ التحضير</button>
            <button data-action="import" type="button">استيراد محفوظ</button>
          </div>
        </details>

        <details class="tahder-section">
          <summary>تعديل وبنك ومشاركة <span>+</span></summary>
          <div class="tahder-section-body">
            <div class="tahder-editor">${createEditor()}</div>
            <button class="tahder-wide-button" data-action="apply-editor" type="button">اعتماد التعديلات</button>
          </div>
        </details>

        <details class="tahder-section">
          <summary>الواجبات والإثراءات <span>+</span></summary>
          <div class="tahder-section-body tahder-grid">
            <button data-action="assignment" type="button">إضافة الواجب</button>
            <button data-action="enrichment" type="button">إضافة إثراء</button>
            <button data-action="resources" type="button">روابط عين ويوتيوب</button>
          </div>
        </details>

        <details class="tahder-section">
          <summary>تقاريري وخطة الإنجاز <span>+</span></summary>
          <div class="tahder-section-body tahder-grid">
            <button data-action="report" type="button">كشف التحضير</button>
            <button data-action="achievement" type="button">ملف الإنجاز</button>
            <button data-action="evidence" type="button">الشواهد</button>
          </div>
        </details>

        <footer class="tahder-footer">نسخة تجريبية محلية · لا ترسل بيانات الدخول</footer>
      </aside>
    `;
  }

  renderAssistant();

  root.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target.closest('.tahder-login-form');

    if (!form) {
      return;
    }

    const formData = new FormData(form);
    session = {
      email: String(formData.get('email') || ''),
      subscription: 'active',
    };
    localStorage.setItem(sessionKey, JSON.stringify(session));
    renderAssistant();
    updateStatus('تم تسجيل الدخول والتحقق من الاشتراك', 'success');
  });

  root.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;

    if (!action) {
      return;
    }

    if (action === 'signout') {
      localStorage.removeItem(sessionKey);
      session = null;
      renderAssistant();
      return;
    }

    if (!session || session.subscription !== 'active') {
      updateStatus('سجل الدخول باشتراك فعال للمتابعة', 'warn');
      return;
    }

    if (action === 'autofill') autofillPrep();
    if (action === 'save') savePrep();
    if (action === 'import') importPrep();
    if (action === 'week') prepareWeek();
    if (action === 'classes') copyToClasses();
    if (action === 'assignment') fillField(findFieldByHints(fieldDefinitions[5].hints), activePrep.assignment);
    if (action === 'enrichment') fillField(findFieldByHints(fieldDefinitions[4].hints), activePrep.enrichment);
    if (action === 'resources') updateStatus('تم تجهيز روابط عين ويوتيوب المقترحة', 'success');
    if (action === 'report') updateStatus('سيتم استخراج كشف التحضير بعد ربط الحساب', 'ready');
    if (action === 'achievement') updateStatus('تم تجهيز قالب ملف الإنجاز', 'success');
    if (action === 'evidence') updateStatus('تم تجهيز قائمة الشواهد', 'success');
    if (action === 'apply-editor') {
      fieldDefinitions.forEach((field) => {
        const input = root.querySelector(`[data-prep-field="${field.key}"]`);
        activePrep[field.key] = input.value;
      });
      updateStatus('تم اعتماد تعديلاتك', 'success');
    }
  });

  document.documentElement.appendChild(root);
  document.documentElement.dataset.tahderExtension = 'active';
  console.info('[Tahder] Extension active on', window.location.href);
})();
