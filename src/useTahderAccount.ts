import React from 'react';
import {
  getActiveSubscription,
  listPreparations,
  recordActivity,
  registerDevice,
  restoreSession,
  readSession,
  signIn,
  signOut,
  type TahderPreparation,
  type TahderSession,
  type TahderSubscription,
} from './tahderApi';

export type TahderAccountState = {
  session: TahderSession | null;
  subscription: TahderSubscription | null;
  preparations: TahderPreparation[];
  loading: boolean;
  error: string | null;
  statusLabel: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: (sessionOverride?: TahderSession | null) => Promise<void>;
};

export function useTahderAccount(): TahderAccountState {
  const [session, setSession] = React.useState<TahderSession | null>(null);
  const [subscription, setSubscription] = React.useState<TahderSubscription | null>(null);
  const [preparations, setPreparations] = React.useState<TahderPreparation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async (sessionOverride?: TahderSession | null) => {
    const activeSession = sessionOverride === undefined ? readSession() : sessionOverride;

    if (!activeSession) {
      setSubscription(null);
      setPreparations([]);
      return;
    }

    const activeSubscription = await getActiveSubscription(activeSession);
    setSubscription(activeSubscription);

    if (activeSubscription) {
      const saved = await listPreparations(activeSession);
      setPreparations(saved);
    } else {
      setPreparations([]);
    }
  }, []);

  React.useEffect(() => {
    let mounted = true;

    async function boot() {
      try {
        const restored = await restoreSession();
        if (!mounted) return;

        setSession(restored);
        await refresh(restored);
      } catch (bootError) {
        if (mounted) {
          setError(bootError instanceof Error ? bootError.message : 'تعذر تحميل الحساب.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    boot();
    return () => {
      mounted = false;
    };
  }, [refresh]);

  const login = React.useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const nextSession = await signIn(email, password);
      const activeSubscription = await getActiveSubscription(nextSession);

      if (!activeSubscription) {
        await signOut();
        throw new Error('الحساب صحيح، لكن الاشتراك غير فعال.');
      }

      await registerDevice(nextSession, 'Mobile app');
      await recordActivity(nextSession, 'mobile_login');
      setSession(nextSession);
      setSubscription(activeSubscription);
      setPreparations(await listPreparations(nextSession));
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'تعذر تسجيل الدخول.');
      throw loginError;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = React.useCallback(async () => {
    setLoading(true);
    try {
      await signOut();
      setSession(null);
      setSubscription(null);
      setPreparations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const statusLabel = !session
    ? 'غير متصل'
    : subscription
      ? `اشتراك ${subscription.status}`
      : 'بدون اشتراك فعال';

  return {
    session,
    subscription,
    preparations,
    loading,
    error,
    statusLabel,
    login,
    logout,
    refresh,
  };
}
