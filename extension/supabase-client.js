(function (global) {
  const config = global.TAHDER_CONFIG || {};
  const authKey = 'tahder-supabase-auth';
  const deviceKey = 'tahder-device-id';

  function isConfigured() {
    return Boolean(config.supabaseUrl && config.publishableKey);
  }

  async function storageGet(key) {
    if (global.chrome?.storage?.local) {
      return (await global.chrome.storage.local.get(key))[key] ?? null;
    }

    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  async function storageSet(key, value) {
    if (global.chrome?.storage?.local) {
      await global.chrome.storage.local.set({ [key]: value });
      return;
    }

    localStorage.setItem(key, JSON.stringify(value));
  }

  async function storageRemove(key) {
    if (global.chrome?.storage?.local) {
      await global.chrome.storage.local.remove(key);
      return;
    }

    localStorage.removeItem(key);
  }

  async function request(path, options = {}) {
    if (!isConfigured()) throw new Error('أضف بيانات Supabase في ملف config.js أولاً.');
    const session = options.session || await storageGet(authKey);
    const response = await fetch(`${config.supabaseUrl}${path}`, {
      ...options,
      headers: {
        apikey: config.publishableKey,
        Authorization: session?.access_token ? `Bearer ${session.access_token}` : `Bearer ${config.publishableKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    const body = await parseResponse(response);

    if (!response.ok) throw new Error(body?.error_description || body?.message || body?.error || 'تعذر الاتصال بالخادم.');
    return body;
  }

  async function parseResponse(response) {
    const text = await response.text();

    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  }

  async function signIn(email, password) {
    const session = await request('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      session: null,
    });
    await storageSet(authKey, session);
    return session;
  }

  async function signOut() {
    const session = await storageGet(authKey);

    if (session) {
      try {
        await request('/auth/v1/logout', { method: 'POST', session });
      } catch (_) {
        // Local removal still signs the extension out if the session already expired.
      }
    }

    await storageRemove(authKey);
  }

  async function restoreSession() {
    const session = await storageGet(authKey);
    if (!session) return null;

    if (session.expires_at && session.expires_at * 1000 > Date.now() + 60000) {
      return session;
    }

    try {
      const refreshed = await request('/auth/v1/token?grant_type=refresh_token', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: session.refresh_token }),
        session: null,
      });
      await storageSet(authKey, refreshed);
      return refreshed;
    } catch (_) {
      await storageRemove(authKey);
      return null;
    }
  }

  async function getActiveSubscription(session) {
    const subscriptions = await request('/rest/v1/subscriptions?select=id,plan_id,status,starts_at,ends_at&order=created_at.desc', { session });
    const now = Date.now();

    return subscriptions.find((item) =>
      ['trial', 'active'].includes(item.status)
      && Date.parse(item.starts_at) <= now
      && (!item.ends_at || Date.parse(item.ends_at) > now),
    ) || null;
  }

  async function listPreparations(session) {
    return request('/rest/v1/preparations?select=id,lesson_title,subject,grade,term,content,status,source,created_at&order=created_at.desc&limit=20', { session });
  }

  async function savePreparation(session, lesson, content) {
    return request('/rest/v1/preparations?select=id,content,status,created_at', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        user_id: session.user.id,
        lesson_title: lesson.lesson_title || 'درس بدون عنوان',
        subject: lesson.subject,
        grade: lesson.grade,
        term: lesson.term,
        content,
        status: 'ready',
        source: 'extension',
      }),
      session,
    });
  }

  async function generatePreparation(session, lesson) {
    return request('/functions/v1/generate-preparation', {
      method: 'POST',
      body: JSON.stringify(lesson),
      session,
    });
  }

  async function registerDevice(session) {
    let deviceId = await storageGet(deviceKey);

    if (!deviceId) {
      deviceId = crypto.randomUUID();
      await storageSet(deviceKey, deviceId);
    }

    return request('/rest/v1/linked_devices?on_conflict=user_id,device_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ user_id: session.user.id, device_id: deviceId, last_seen_at: new Date().toISOString() }),
      session,
    });
  }

  async function recordActivity(session, eventType, metadata = {}) {
    return request('/rest/v1/activity_logs', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ user_id: session.user.id, event_type: eventType, metadata }),
      session,
    });
  }

  global.TahderSupabase = {
    generatePreparation,
    getActiveSubscription,
    isConfigured,
    listPreparations,
    recordActivity,
    registerDevice,
    restoreSession,
    savePreparation,
    signIn,
    signOut,
  };
})(globalThis);
