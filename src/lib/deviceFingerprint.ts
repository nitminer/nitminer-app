/**
 * Device fingerprinting utility
 * Creates a unique identifier for each device/browser combination
 * This ensures only ONE browser can be logged in per account on a device
 */

export interface DeviceInfo {
  deviceId: string;
  fingerprint: string;
  deviceName: string;
  browser: string;
  os: string;
}

/**
 * Generate a unique device fingerprint based on browser/device characteristics
 * Includes browser type to restrict different browsers on same device
 */
export async function generateDeviceFingerprint(): Promise<string> {
  const { browser, os } = parseUserAgent();
  
  const components = {
    // Get user agent
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    
    // Include browser type to prevent same-device multi-browser login
    browser: browser,
    
    // Get language
    language: typeof navigator !== 'undefined' ? navigator.language : 'unknown',
    
    // Get timezone
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    
    // Get screen resolution
    screenResolution: typeof window !== 'undefined' 
      ? `${window.screen.width}x${window.screen.height}` 
      : 'unknown',
    
    // Get color depth
    colorDepth: typeof window !== 'undefined' ? window.screen.colorDepth : 'unknown',
    
    // Get canvas fingerprint
    canvasFingerprint: await getCanvasFingerprint(),
    
    // Get WebGL fingerprint
    webglFingerprint: getWebGLFingerprint(),
  };

  // Create a hash from all components
  const fingerprintString = JSON.stringify(components);
  return await hashString(fingerprintString);
}

/**
 * Get Canvas fingerprint
 */
function getCanvasFingerprint(): Promise<string> {
  return new Promise((resolve) => {
    try {
      const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
      if (!canvas) {
        resolve('unknown');
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('unknown');
        return;
      }

      const text = 'Canvas fingerprint';
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText(text, 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText(text, 4, 17);

      const canvasData = canvas.toDataURL();
      resolve(canvasData.substring(0, 50)); // Use first 50 chars as fingerprint
    } catch (e) {
      resolve('unknown');
    }
  });
}

/**
 * Get WebGL fingerprint
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    if (!canvas) return 'unknown';

    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
    if (!gl) return 'unknown';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const vendor = gl.getParameter((debugInfo as any).UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter((debugInfo as any).UNMASKED_RENDERER_WEBGL);
      return `${vendor}-${renderer}`.substring(0, 50);
    }

    return 'unknown';
  } catch (e) {
    return 'unknown';
  }
}

/**
 * Hash a string using SHA-256
 */
async function hashString(str: string): Promise<string> {
  try {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (e) {
    // Fallback to simple hash if crypto API not available
    return simpleHash(str);
  }
}

/**
 * Simple hash function for fallback
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Parse user agent to get browser and OS info
 */
export function parseUserAgent(): { browser: string; os: string } {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';

  let browserName = 'Unknown';
  let osName = 'Unknown';

  // Detect browser
  if (ua.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
  } else if (ua.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
  } else if (ua.indexOf('Safari') > -1) {
    browserName = 'Safari';
  } else if (ua.indexOf('Edge') > -1) {
    browserName = 'Edge';
  } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
    browserName = 'Opera';
  }

  // Detect OS
  if (ua.indexOf('Windows') > -1) {
    osName = 'Windows';
  } else if (ua.indexOf('Mac') > -1) {
    osName = 'macOS';
  } else if (ua.indexOf('X11') > -1) {
    osName = 'Linux';
  } else if (ua.indexOf('Linux') > -1) {
    osName = 'Linux';
  } else if (ua.indexOf('Android') > -1) {
    osName = 'Android';
  } else if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) {
    osName = 'iOS';
  }

  return { browser: browserName, os: osName };
}

/**
 * Generate or retrieve device ID from localStorage
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return '';

  const DEVICE_ID_KEY = 'nitminer_device_id';
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    // Generate a unique ID
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}

/**
 * Get device name based on user agent
 */
export function getDeviceName(): string {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  
  if (ua.indexOf('iPhone') > -1) return 'iPhone';
  if (ua.indexOf('iPad') > -1) return 'iPad';
  if (ua.indexOf('Android') > -1) return 'Android Device';
  if (ua.indexOf('Windows') > -1) return 'Windows PC';
  if (ua.indexOf('Mac') > -1) return 'Mac';
  if (ua.indexOf('Linux') > -1) return 'Linux Device';
  
  return 'Unknown Device';
}

/**
 * Generate complete device info
 */
export async function generateDeviceInfo(): Promise<DeviceInfo> {
  const deviceId = getOrCreateDeviceId();
  const fingerprint = await generateDeviceFingerprint();
  const { browser, os } = parseUserAgent();
  const deviceName = getDeviceName();

  return {
    deviceId,
    fingerprint,
    deviceName,
    browser,
    os,
  };
}
