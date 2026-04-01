/**
 * TrustInn auth compatibility layer for nitminer-app.
 * Adapts trustinn-gui auth calls to NextAuth session data.
 */

export interface NitMinerUser {
  id: string;
  mongoId?: string;
  name: string;
  email: string;
  role: string;
  isPremium: boolean;
  trialCount: number;
  isEmailVerified?: boolean;
  subscription?: {
    plan: string | null;
    status: string | null;
    startDate: string | null;
    endDate: string | null;
  };
}

export interface SessionData {
  user: NitMinerUser;
  token: string;
  expiresAt: string;
  issuedAt: string;
  requiresEmailVerification?: boolean;
}

export interface SessionStatus {
  isValid: boolean;
  hasAccess: boolean;
  accessReason: 'premium' | 'trial' | 'no_access';
  trialCount: number;
  user?: NitMinerUser;
}

const STORAGE_KEYS = {
  token: 'trustinn_token',
  userId: 'trustinn_user_id',
  expiresAt: 'token_expires',
};

function makePseudoToken(email: string) {
  const safe = btoa(unescape(encodeURIComponent(email || 'user')))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `nitminer.${safe}.session`;
}

function mapSessionToUser(session: any): NitMinerUser | null {
  if (!session?.user?.email) return null;

  return {
    id: session.user.id || session.user.email,
    mongoId: session.user.mongoId,
    name: session.user.name || session.user.email.split('@')[0],
    email: session.user.email,
    role: session.user.role || 'user',
    isPremium: !!session.user.isPremium,
    trialCount: Number(session.user.trialCount ?? 5),
    isEmailVerified: session.user.isEmailVerified ?? true,
    subscription: {
      plan: session.user.subscription?.plan ?? null,
      status: session.user.subscription?.status ?? null,
      startDate: session.user.subscription?.startDate ?? null,
      endDate: session.user.subscription?.endDate ?? null,
    },
  };
}

async function fetchSessionUser(): Promise<NitMinerUser | null> {
  try {
    const res = await fetch('/api/auth/session', { credentials: 'include' });
    if (!res.ok) return null;
    const session = await res.json();
    return mapSessionToUser(session);
  } catch {
    return null;
  }
}

export function extractTokenFromURL(): string | null {
  if (typeof window === 'undefined') return null;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('token');
}

export function storeSession(sessionData: SessionData): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEYS.token, sessionData.token);
  sessionStorage.setItem(STORAGE_KEYS.userId, sessionData.user.id);
  sessionStorage.setItem(STORAGE_KEYS.expiresAt, sessionData.expiresAt);
}

export function getStoredSessionToken(): { token: string; userId: string; expiresAt: string } | null {
  if (typeof window === 'undefined') return null;
  const token = sessionStorage.getItem(STORAGE_KEYS.token);
  const userId = sessionStorage.getItem(STORAGE_KEYS.userId);
  const expiresAt = sessionStorage.getItem(STORAGE_KEYS.expiresAt);
  if (!token || !userId || !expiresAt) return null;
  return { token, userId, expiresAt };
}

export function getStoredUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(STORAGE_KEYS.userId);
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEYS.token);
  sessionStorage.removeItem(STORAGE_KEYS.userId);
  sessionStorage.removeItem(STORAGE_KEYS.expiresAt);
}

export async function fetchUserFromDB(_userId: string): Promise<NitMinerUser | null> {
  return fetchSessionUser();
}

export async function fetchTrialCountByEmail(_email: string): Promise<{ trialCount: number; isPremium: boolean } | null> {
  const user = await fetchSessionUser();
  if (!user) return null;
  return { trialCount: user.trialCount, isPremium: user.isPremium };
}

export async function validateToken(_token: string): Promise<{ isValid: boolean; data?: SessionData; error?: string }> {
  const user = await fetchSessionUser();
  if (!user) {
    return { isValid: false, error: 'Session not found' };
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const sessionData: SessionData = {
    user,
    token: _token || makePseudoToken(user.email),
    expiresAt,
    issuedAt: new Date().toISOString(),
  };
  return { isValid: true, data: sessionData };
}

export async function checkSessionStatus(userId: string): Promise<SessionStatus> {
  const user = await fetchUserFromDB(userId);
  if (!user) {
    return {
      isValid: false,
      hasAccess: false,
      accessReason: 'no_access',
      trialCount: 0,
    };
  }

  const has = hasAccess(user);
  return {
    isValid: true,
    hasAccess: has,
    accessReason: user.isPremium ? 'premium' : user.trialCount > 0 ? 'trial' : 'no_access',
    trialCount: user.trialCount,
    user,
  };
}

export async function consumeTrial(userId: string): Promise<{ consumed: boolean; remainingTrials: number; error?: string }> {
  try {
    const user = await fetchUserFromDB(userId);
    if (!user?.email) {
      return { consumed: false, remainingTrials: 0, error: 'Session not found' };
    }

    const response = await fetch('/api/auth/consume-trail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: user.email }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        consumed: false,
        remainingTrials: Number(data?.noOfTrails ?? data?.trialCount ?? 0),
        error: data?.error || 'Failed to consume trial',
      };
    }

    return {
      consumed: true,
      remainingTrials: Number(data?.noOfTrails ?? data?.trialCount ?? 0),
    };
  } catch (error) {
    return {
      consumed: false,
      remainingTrials: 0,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export function hasAccess(user: NitMinerUser): boolean {
  return user.isPremium || user.trialCount > 0;
}

export async function isSessionExpired(expiresAt: string): Promise<boolean> {
  return new Date() >= new Date(expiresAt);
}

export function redirectToNitMiner(path: string = '/login'): void {
  if (typeof window === 'undefined') return;

  if (path === '/login') {
    window.location.href = '/login?redirect=/trustinn';
    return;
  }

  if (path.startsWith('/')) {
    window.location.href = path;
    return;
  }

  window.location.href = `https://www.nitminer.com${path}`;
}

export async function initializeAuth(): Promise<NitMinerUser | null> {
  const user = await fetchSessionUser();
  if (!user) {
    clearSession();
    return null;
  }

  const token = extractTokenFromURL() || makePseudoToken(user.email);
  const sessionData: SessionData = {
    user,
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    issuedAt: new Date().toISOString(),
  };

  storeSession(sessionData);
  return user;
}
