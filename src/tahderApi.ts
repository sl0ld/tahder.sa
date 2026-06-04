import { tahderConfig } from './tahderConfig';

const authKey = 'tahder-mobile-auth';
const deviceKey = 'tahder-mobile-device-id';

type Json = Record<string, unknown>;

export type TahderSession = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user: {
    id: string;
    email?: string;
  };
};

export type TahderSubscription = {
  id: string;
  plan_id: string;
  status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
  starts_at: string;
  ends_at: string | null;
};

export type TahderPreparation = {
  id: string;
  lesson_title: string;
  subject: string | null;
  grade: string | null;
  term: string | null;
  content: Json;
  status: string;
  source: string;
  created_at: string;
};

export type LessonPayload = {
  lesson_title: string;
  subject?: string;
  grade?: string;
  term?: string;
  unit_title?: string;
  class_names?: string[];
};

const memoryStore = new Map<string, string>();

function isConfigured() {
  return Boolean(tahderConfig.supabaseUrl && tahderConfig.publishableKey);
}

function getLocalStorage() {
  return typeof globalThis.localStorage === 'undefined' ? null : globalThis.localStorage;
}

function readStored<T>(key: string): T | null {
  const value = getLocalStorage()?.getItem(key) ?? memoryStore.get(key) ?? null;
  return value ? JSON.parse(value) as T : null;
}

function writeStored(key: string, value: unknown) {
  const serialized = JSON.stringify(value);
  const storage = getLocalStorage();

  if (storage) {
    storage.setItem(key, serialized);
    return;
  }

  memoryStore.set(key, serialized);
}

function removeStored(key: string) {
  getLocalStorage()?.removeItem(key);
  memoryStore.delete(key);
}

async function parseResponse(response: Response) {
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

async function request<T>(path: string, options: RequestInit & { session?: TahderSession | null } = {}) {
  if (!isConfigured()) {
    throw new Error('لم يتم ربط Supabase بعد.');
  }

  const session = options.session === undefined ? readSession() : options.session;
  const response = await fetch(`${tahderConfig.supabaseUrl}${path}`, {
    ...options,
    headers: {
      apikey: tahderConfig.publishableKey,
      Authorization: session?.access_token ? `Bearer ${session.access_token}` : `Bearer ${tahderConfig.publishableKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const body = await parseResponse(response);

  if (!response.ok) {
    const errorBody = body as { error_description?: string; message?: string; error?: string } | null;
    throw new Error(errorBody?.error_description || errorBody?.message || errorBody?.error || 'تعذر الاتصال بالخادم.');
  }

  return body as T;
}

export function readSession() {
  return readStored<TahderSession>(authKey);
}

export async function signIn(email: string, password: string) {
  const session = await request<TahderSession>('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    session: null,
  });
  writeStored(authKey, session);
  return session;
}

export async function signOut() {
  const session = readSession();

  if (session) {
    try {
      await request('/auth/v1/logout', { method: 'POST', session });
    } catch {
      // Remove the local session even if the remote session already expired.
    }
  }

  removeStored(authKey);
}

export async function restoreSession() {
  const session = readSession();
  if (!session) return null;

  if (session.expires_at && session.expires_at * 1000 > Date.now() + 60000) {
    return session;
  }

  if (!session.refresh_token) {
    removeStored(authKey);
    return null;
  }

  try {
    const refreshed = await request<TahderSession>('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: session.refresh_token }),
      session: null,
    });
    writeStored(authKey, refreshed);
    return refreshed;
  } catch {
    removeStored(authKey);
    return null;
  }
}

export async function getActiveSubscription(session: TahderSession) {
  const subscriptions = await request<TahderSubscription[]>(
    '/rest/v1/subscriptions?select=id,plan_id,status,starts_at,ends_at&order=created_at.desc',
    { session },
  );
  const now = Date.now();

  return subscriptions.find((item) =>
    ['trial', 'active'].includes(item.status)
    && Date.parse(item.starts_at) <= now
    && (!item.ends_at || Date.parse(item.ends_at) > now),
  ) ?? null;
}

export async function registerDevice(session: TahderSession, label = 'Mobile app') {
  let deviceId = readStored<string>(deviceKey);

  if (!deviceId) {
    deviceId = typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `mobile-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    writeStored(deviceKey, deviceId);
  }

  return request('/rest/v1/linked_devices?on_conflict=user_id,device_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      user_id: session.user.id,
      device_id: deviceId,
      label,
      last_seen_at: new Date().toISOString(),
    }),
    session,
  });
}

export async function recordActivity(session: TahderSession, eventType: string, metadata: Json = {}) {
  return request('/rest/v1/activity_logs', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ user_id: session.user.id, event_type: eventType, metadata }),
    session,
  });
}

export async function listPreparations(session: TahderSession) {
  return request<TahderPreparation[]>(
    '/rest/v1/preparations?select=id,lesson_title,subject,grade,term,content,status,source,created_at&order=created_at.desc&limit=20',
    { session },
  );
}

export async function savePreparation(session: TahderSession, lesson: LessonPayload, content: Json, source = 'mobile') {
  return request<TahderPreparation[]>('/rest/v1/preparations?select=id,lesson_title,subject,grade,term,content,status,source,created_at', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      user_id: session.user.id,
      lesson_title: lesson.lesson_title,
      subject: lesson.subject,
      grade: lesson.grade,
      term: lesson.term,
      class_names: lesson.class_names ?? [],
      content,
      status: 'ready',
      source,
    }),
    session,
  });
}

export async function generatePreparation(session: TahderSession, lesson: LessonPayload) {
  return request<{ id: string; content: Json }>('/functions/v1/generate-preparation', {
    method: 'POST',
    body: JSON.stringify(lesson),
    session,
  });
}
