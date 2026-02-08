/**
 * Electron-specific utilities for session management and device fingerprinting
 */

declare global {
  interface Window {
    nitminerElectron?: {
      getSession: () => Promise<any>;
      setSession: (data: any) => Promise<boolean>;
      clearSession: () => Promise<boolean>;
      getDeviceFingerprint: () => Promise<any>;
      checkDuplicateSession: (data: any) => Promise<any>;
      invalidateOtherSessions: () => Promise<any>;
      validateToken: (token: string) => Promise<any>;
      logout: () => Promise<any>;
      getPlatform: () => string;
      getVersion: () => string;
    };
  }
}

export const isElectronApp = () => {
  return typeof window !== 'undefined' && (window as any).nitminerElectron !== undefined;
};

/**
 * Get device fingerprint - works in both web and Electron
 */
export const getElectronDeviceFingerprint = async () => {
  if (!isElectronApp()) return null;
  
  try {
    return await window.nitminerElectron.getDeviceFingerprint();
  } catch (error) {
    console.error('Error getting device fingerprint:', error);
    return null;
  }
};

/**
 * Check for duplicate sessions in Electron
 */
export const checkElectronDuplicateSession = async (sessionData) => {
  if (!isElectronApp()) return { isDuplicate: false };
  
  try {
    return await window.nitminerElectron.checkDuplicateSession(sessionData);
  } catch (error) {
    console.error('Error checking duplicate session:', error);
    return { isDuplicate: false };
  }
};

/**
 * Get stored session from Electron store
 */
export const getElectronSession = async () => {
  if (!isElectronApp()) return null;
  
  try {
    return await window.nitminerElectron.getSession();
  } catch (error) {
    console.error('Error getting Electron session:', error);
    return null;
  }
};

/**
 * Store session in Electron store
 */
export const setElectronSession = async (sessionData) => {
  if (!isElectronApp()) return false;
  
  try {
    return await window.nitminerElectron.setSession(sessionData);
  } catch (error) {
    console.error('Error storing Electron session:', error);
    return false;
  }
};

/**
 * Clear session from Electron
 */
export const clearElectronSession = async () => {
  if (!isElectronApp()) return false;
  
  try {
    return await window.nitminerElectron.clearSession();
  } catch (error) {
    console.error('Error clearing Electron session:', error);
    return false;
  }
};

/**
 * Validate JWT token in Electron
 */
export const validateElectronToken = async (token) => {
  if (!isElectronApp()) return { isValid: false };
  
  try {
    return await window.nitminerElectron.validateToken(token);
  } catch (error) {
    console.error('Error validating token:', error);
    return { isValid: false };
  }
};

/**
 * Logout in Electron
 */
export const electronLogout = async () => {
  if (!isElectronApp()) return false;
  
  try {
    const result = await window.nitminerElectron.logout();
    return result.success;
  } catch (error) {
    console.error('Error logging out:', error);
    return false;
  }
};

/**
 * Invalidate other sessions
 */
export const invalidateElectronOtherSessions = async () => {
  if (!isElectronApp()) return false;
  
  try {
    return await window.nitminerElectron.invalidateOtherSessions();
  } catch (error) {
    console.error('Error invalidating sessions:', error);
    return false;
  }
};

/**
 * Monitor session invalidation events in Electron
 */
export const monitorElectronSessionEvents = (onSessionInvalidated, onLogout) => {
  if (!isElectronApp()) return () => {};
  
  const handleSessionInvalidated = () => {
    if (onSessionInvalidated) onSessionInvalidated();
  };
  
  const handleLogout = () => {
    if (onLogout) onLogout();
  };
  
  window.addEventListener('session-invalidated', handleSessionInvalidated);
  window.addEventListener('logout-from-other-window', handleLogout);
  
  return () => {
    window.removeEventListener('session-invalidated', handleSessionInvalidated);
    window.removeEventListener('logout-from-other-window', handleLogout);
  };
};
