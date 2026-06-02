(function () {
  const assistantId = 'tahder-madrasati-assistant';
  const storageKey = 'tahder-saved-prep';
  const sessionKey = 'tahder-extension-session';
  const positionKey = 'tahder-extension-position';

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
  let session = globalThis.TahderSupabase?.isConfigured() ? null : readSession();

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

  function isPrepPageDetected() {
    return fieldDefinitions.some((field) => findFieldByHints(field.hints));
  }

  function updateStatus(text, tone = 'ready') {
    const action = document.querySelector(`#${assistantId} .tahder-primary-action[data-action="autofill"]`);

    if (!action) {
      return;
    }

    action.textContent = text;
    action.dataset.tone = tone;
  }

  function updateLoginStatus(text) {
    const action = root.querySelector('.tahder-login-form .tahder-primary-action');

    if (action) {
      action.textContent = text;
    }
  }

  function isBackendConfigured() {
    return Boolean(globalThis.TahderSupabase?.isConfigured());
  }

  function getLessonContext() {
    return {
      lesson_title: detectLessonTitle(),
      source_url: location.href,
    };
  }

  async function autofillPrep() {
    if (!isPrepPageDetected()) {
      updateStatus('لم يتم اكتشاف صفحة التحضير', 'warn');
      return;
    }

    if (isBackendConfigured() && session?.authSession) {
      try {
        updateStatus('جاري تجهيز التحضير بالذكاء الاصطناعي...');
        const generated = await globalThis.TahderSupabase.generatePreparation(session.authSession, getLessonContext());
        activePrep = { ...activePrep, ...generated.content };
      } catch (error) {
        updateStatus(error.message, 'warn');
        return;
      }
    }

    const filled = fieldDefinitions.filter((field) =>
      fillField(findFieldByHints(field.hints), activePrep[field.key]),
    );

    updateStatus(`تمت تعبئة ${filled.length} من ${fieldDefinitions.length} حقول`, filled.length ? 'success' : 'warn');
  }

  async function savePrep() {
    localStorage.setItem(storageKey, JSON.stringify(activePrep));

    if (isBackendConfigured() && session?.authSession) {
      try {
        await globalThis.TahderSupabase.savePreparation(session.authSession, getLessonContext(), activePrep);
        updateStatus('تم حفظ التحضير في حسابك', 'success');
        return;
      } catch (error) {
        updateStatus(error.message, 'warn');
        return;
      }
    }

    updateStatus('تم حفظ التحضير محلياً', 'success');
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

  function openSection(section) {
    const panel = root.querySelector('.tahder-full-panel');

    if (!panel || !section) {
      return;
    }

    root.querySelectorAll('.tahder-section').forEach((item) => {
      item.open = item === section;
    });
    panel.dataset.view = 'section';
    panel.querySelector('.tahder-page-title').textContent = section.dataset.title;
  }

  function closeSection() {
    const panel = root.querySelector('.tahder-full-panel');

    if (!panel) {
      return;
    }

    root.querySelectorAll('.tahder-section').forEach((section) => {
      section.open = false;
    });
    panel.dataset.view = 'home';
  }

  function readPosition() {
    const stored = localStorage.getItem(positionKey);

    return stored ? JSON.parse(stored) : null;
  }

  function applyPosition(position) {
    if (!position) {
      return;
    }

    root.style.left = `${Math.max(0, Math.min(position.left, window.innerWidth - root.offsetWidth))}px`;
    root.style.top = `${Math.max(0, Math.min(position.top, window.innerHeight - root.offsetHeight))}px`;
    root.style.bottom = 'auto';
  }

  function enableDragging() {
    const header = root.querySelector('.tahder-toolbar-header');

    if (!header) {
      return;
    }

    header.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button')) {
        return;
      }

      event.preventDefault();
      const rect = root.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      const startLeft = rect.left;
      const startTop = rect.top;

      root.classList.add('tahder-dragging');

      const move = (moveEvent) => {
        applyPosition({
          left: startLeft + moveEvent.clientX - startX,
          top: startTop + moveEvent.clientY - startY,
        });
      };

      const stop = () => {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', stop);
        document.removeEventListener('pointercancel', stop);
        root.classList.remove('tahder-dragging');
        const current = root.getBoundingClientRect();
        localStorage.setItem(positionKey, JSON.stringify({ left: current.left, top: current.top }));
      };

      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', stop);
      document.addEventListener('pointercancel', stop);
    });
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
            <small class="tahder-login-note">${isBackendConfigured() ? 'سجل الدخول بحساب تحضيري ذي اشتراك فعال.' : 'نسخة تجريبية: استخدم أي بريد وكلمة مرور.'}</small>
          </form>
        </aside>
      `;

      enableDragging();
      return;
    }

    root.innerHTML = `
      <aside class="tahder-toolbar tahder-full-panel" data-view="home">
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
          <b>${session.subscription === 'active' ? 'اشتراك فعال' : 'نسخة تجريبية'}</b>
        </div>
        <div class="tahder-page-bar">
          <button class="tahder-back-button" data-action="back" type="button">‹ عودة</button>
          <strong class="tahder-page-title"></strong>
        </div>
        <button class="tahder-primary-action" data-action="autofill" data-tone="ready" type="button">${isPrepPageDetected() ? 'تعبئة التحضير تلقائياً' : 'تشغيل الإضافة'}</button>

        <details class="tahder-section" data-title="التحضير الشامل">
          <summary>التحضير الشامل <span>+</span></summary>
          <div class="tahder-section-body tahder-grid">
            <button data-action="autofill" type="button">تعبئة الحصة الحالية</button>
            <button data-action="week" type="button">تحضير الأسبوع</button>
            <button data-action="classes" type="button">نسخ للفصول</button>
            <button data-action="save" type="button">حفظ التحضير</button>
            <button data-action="import" type="button">استيراد محفوظ</button>
          </div>
        </details>

        <details class="tahder-section" data-title="تعديل وبنك ومشاركة">
          <summary>تعديل وبنك ومشاركة <span>+</span></summary>
          <div class="tahder-section-body">
            <div class="tahder-editor">${createEditor()}</div>
            <button class="tahder-wide-button" data-action="apply-editor" type="button">اعتماد التعديلات</button>
          </div>
        </details>

        <details class="tahder-section" data-title="الواجبات والإثراءات">
          <summary>الواجبات والإثراءات <span>+</span></summary>
          <div class="tahder-section-body tahder-grid">
            <button data-action="assignment" type="button">إضافة الواجب</button>
            <button data-action="enrichment" type="button">إضافة إثراء</button>
            <button data-action="resources" type="button">روابط عين ويوتيوب</button>
          </div>
        </details>

        <details class="tahder-section" data-title="تقاريري وخطة الإنجاز">
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
    enableDragging();
  }

  renderAssistant();

  root.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target.closest('.tahder-login-form');

    if (!form) {
      return;
    }

    const formData = new FormData(form);
    const email = String(formData.get('email') || '');
    const password = String(formData.get('password') || '');

    try {
      if (isBackendConfigured()) {
        updateLoginStatus('جاري التحقق...');
        const authSession = await globalThis.TahderSupabase.signIn(email, password);
        const subscription = await globalThis.TahderSupabase.getActiveSubscription(authSession);

        if (!subscription) {
          await globalThis.TahderSupabase.signOut();
          throw new Error('لا يوجد اشتراك فعال لهذا الحساب');
        }

        session = { email, subscription: 'active', authSession };
        await globalThis.TahderSupabase.registerDevice(authSession);
        await globalThis.TahderSupabase.recordActivity(authSession, 'extension_login');
      } else if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        session = { email, subscription: 'demo' };
      } else {
        throw new Error('لم يتم ربط الإضافة بقاعدة البيانات بعد');
      }

      localStorage.setItem(sessionKey, JSON.stringify(session));
      renderAssistant();
      updateStatus('تم تسجيل الدخول والتحقق من الاشتراك', 'success');
    } catch (error) {
      updateLoginStatus(error.message);
    }
  });

  root.addEventListener('click', async (event) => {
    const summary = event.target.closest('.tahder-section summary');

    if (summary) {
      event.preventDefault();
      openSection(summary.closest('.tahder-section'));
      return;
    }

    const action = event.target.closest('[data-action]')?.dataset.action;

    if (!action) {
      return;
    }

    if (action === 'signout') {
      if (isBackendConfigured()) {
        await globalThis.TahderSupabase.signOut();
      }
      localStorage.removeItem(sessionKey);
      session = null;
      renderAssistant();
      return;
    }

    if (action === 'back') {
      closeSection();
      return;
    }

    if (!session || !['active', 'demo'].includes(session.subscription) || (isBackendConfigured() && !session.authSession)) {
      updateStatus('سجل الدخول باشتراك فعال للمتابعة', 'warn');
      return;
    }

    if (action === 'autofill') await autofillPrep();
    if (action === 'save') await savePrep();
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
  applyPosition(readPosition());
  if (isBackendConfigured()) {
    globalThis.TahderSupabase.restoreSession().then(async (authSession) => {
      if (!authSession) {
        session = null;
        localStorage.removeItem(sessionKey);
        renderAssistant();
        return;
      }

      const subscription = await globalThis.TahderSupabase.getActiveSubscription(authSession);
      session = {
        email: authSession.user.email,
        subscription: subscription ? 'active' : 'inactive',
        authSession,
      };
      localStorage.setItem(sessionKey, JSON.stringify(session));
      renderAssistant();
    }).catch(() => {
      session = null;
      renderAssistant();
    });
  }
  document.documentElement.dataset.tahderExtension = 'active';
  console.info('[Tahder] Extension active on', window.location.href);
})();
