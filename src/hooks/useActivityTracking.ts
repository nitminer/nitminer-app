import { useEffect, useRef, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const ACTIVITY_TIMEOUT_MINUTES = 180; // 3 hours
const TRACK_ACTIVITY_INTERVAL = 60000; // Track every 1 minute
const INACTIVITY_CHECK_INTERVAL = 300000; // Check every 5 minutes

export function useActivityTracking() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const trackingTimer = useRef<NodeJS.Timeout | null>(null);
  const checkExpiryTimer = useRef<NodeJS.Timeout | null>(null);
  const lastActivityTime = useRef<number>(Date.now());

  // Track activity
  const trackActivity = useCallback(
    async (action: string = 'page_view', page?: string) => {
      if (!session?.user) return;

      try {
        const response = await fetch('/api/activity/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            page: page || window.location.pathname,
            device: getDeviceType(),
            browser: getBrowserInfo(),
            os: getOSInfo(),
          }),
        });

        const data = await response.json();

        // If session is expired, logout  
        if (data.sessionExpired) {
          handleSessionExpire();
        }

        lastActivityTime.current = Date.now();
      } catch (error) {
        console.error('Error tracking activity:', error);
      }
    },
    [session]
  );

  // Check inactivity
  const checkInactivity = useCallback(async () => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/activity/track', {
        method: 'GET',
      });

      const data = await response.json();

      if (data.sessionExpired && data.inactiveMinutes > ACTIVITY_TIMEOUT_MINUTES) {
        handleSessionExpire();
      }
    } catch (error) {
      console.error('Error checking inactivity:', error);
    }
  }, [session]);

  // Handle session expiry
  const handleSessionExpire = useCallback(() => {
    if (typeof window !== 'undefined') {
      const keys = ['nitminer_session', 'user_email', 'login_success', 'login_time'];
      keys.forEach((k) => {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      });
    }

    signOut({ callbackUrl: '/login', redirect: false });
    router.push('/login');
  }, [router]);

  // Setup activity listeners
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      lastActivityTime.current = Date.now();
    };

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, true);
    });

    // Track activity periodically
    trackingTimer.current = setInterval(() => {
      trackActivity('activity', window.location.pathname);
    }, TRACK_ACTIVITY_INTERVAL);

    // Check for expiry periodically
    checkExpiryTimer.current = setInterval(() => {
      checkInactivity();
    }, INACTIVITY_CHECK_INTERVAL);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity, true);
      });

      if (trackingTimer.current) clearInterval(trackingTimer.current);
      if (checkExpiryTimer.current) clearInterval(checkExpiryTimer.current);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [status, session, trackActivity, checkInactivity]);

  return { trackActivity, lastActivityTime: lastActivityTime.current };
}

// Helper functions
function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/mobile|android|iphone|ipad|ipod/i.test(ua)) {
    return 'Mobile';
  }
  if (/tablet|ipad/i.test(ua)) {
    return 'Tablet';
  }
  return 'Desktop';
}

function getBrowserInfo(): string {
  const ua = navigator.userAgent;
  if (ua.indexOf('Chrome') !== -1) return 'Chrome';
  if (ua.indexOf('Safari') !== -1) return 'Safari';
  if (ua.indexOf('Firefox') !== -1) return 'Firefox';
  if (ua.indexOf('Edge') !== -1) return 'Edge';
  if (ua.indexOf('Opera') !== -1) return 'Opera';
  return 'Unknown';
}

function getOSInfo(): string {
  const ua = navigator.userAgent;
  if (ua.indexOf('Win') !== -1) return 'Windows';
  if (ua.indexOf('Mac') !== -1) return 'macOS';
  if (ua.indexOf('Linux') !== -1) return 'Linux';
  if (ua.indexOf('Android') !== -1) return 'Android';
  if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) return 'iOS';
  return 'Unknown';
}
