'use client';

import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiMenu, FiX, FiChevronDown, FiLogOut, FiUser } from 'react-icons/fi';
import { ThemeToggle } from "./theme-toggle";
import { AboutUsDropdown } from "./AboutUsDropdown";
import { ProductsDropdown } from "./ProductsDropdown";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TrustInnAccessModal from "./TrustInnAccessModal";
import DuplicateSessionModal from "./DuplicateSessionModal";
import { generateDeviceFingerprint } from "@/lib/deviceFingerprint";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedDropdown, setExpandedDropdown] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [trustInnModalOpen, setTrustInnModalOpen] = useState(false);
  const [trustInnAccessType, setTrustInnAccessType] = useState('success');
  const [userTrials, setUserTrials] = useState(0);
  const [duplicateSessionModalOpen, setDuplicateSessionModalOpen] = useState(false);
  const [existingSessions, setExistingSessions] = useState([]);
  const [pendingTrustInnRedirect, setPendingTrustInnRedirect] = useState(null);
  const [loadingDuplicateCheck, setLoadingDuplicateCheck] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const profileMenuRef = useRef(null);
  
  // JWT-based session state
  const [jwtSessionData, setJwtSessionData] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  
  // Check JWT session on mount and when component updates
  useEffect(() => {
    const checkJWTSession = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();

        if (data.authenticated && data.user) {
          setJwtSessionData(data.user);
        } else {
          setJwtSessionData(null);
        }
      } catch (error) {
        console.warn('Error checking JWT session in header:', error);
        setJwtSessionData(null);
      } finally {
        setIsLoadingSession(false);
      }
    };

    checkJWTSession();
  }, []);
  
  // Use JWT session data for authentication status
  const isLoggedIn = !!jwtSessionData;
  const userEmail = jwtSessionData?.email || '';
  const userName = jwtSessionData?.firstName ? `${jwtSessionData.firstName} ${jwtSessionData.lastName || ''}`.trim() : userEmail?.split('@')[0] || 'User';
  const userRole = jwtSessionData?.role || 'user';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    // Close profile menu first
    setShowProfileMenu(false);
    
    // Clear all stored session data
    try {
      localStorage.removeItem('nitminer_session');
      localStorage.removeItem('user');
      sessionStorage.removeItem('nitminer_session');
      sessionStorage.removeItem('tempUser');
      sessionStorage.removeItem('deviceInfo');
    } catch (error) {
      console.warn('Error clearing stored session:', error);
    }
    
    // If Electron app, clear Electron session too
    if (typeof window !== 'undefined' && window.nitminerElectron) {
      try {
        await window.nitminerElectron.logout();
      } catch (error) {
        console.warn('Error clearing Electron session:', error);
      }
    }
    
    // Call logout endpoint to clear cookies and invalidate JWT tokens
    try {
      const logoutResponse = await fetch('/api/auth/session/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });

      if (logoutResponse.ok) {
        console.log('Successfully logged out from server');
      } else {
        console.warn('Logout endpoint returned non-OK status:', logoutResponse.status);
      }
    } catch (error) {
      console.warn('Error calling logout endpoint:', error);
    }
    
    // Clear JWT session data from state
    setJwtSessionData(null);
    
    // Small delay to ensure state updates before redirect
    setTimeout(() => {
      // Force redirect to login
      window.location.href = '/login?logout=true';
    }, 100);
  };

  const getDashboardUrl = () => {
    return userRole === 'admin' ? '/admin/dashboard' : '/dashboard';
  };

  const getDeviceInfo = () => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    
    // Parse browser
    let browser = 'Unknown';
    if (ua.includes('Chrome') && !ua.includes('Edge')) browser = 'Chrome';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edge')) browser = 'Edge';
    
    // Parse OS
    let os = 'Unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'MacOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';
    
    // Get device name
    const deviceName = `${os} - ${browser}`;
    
    // Generate device ID based on browser and OS
    const deviceId = `${browser}-${os}`.toLowerCase();
    
    return { browser, os, deviceId, deviceName };
  };

  const handleTrustInnAccessWithDuplicateCheck = async () => {
    try {
      setLoadingDuplicateCheck(true);
      
      // Generate device fingerprint
      const fingerprint = await generateDeviceFingerprint();
      const { deviceId, browser, os, deviceName } = getDeviceInfo();
      
      // Check for duplicate sessions using JWT email
      const checkResponse = await fetch('/api/auth/session/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: userEmail,
          deviceId,
          deviceFingerprint: fingerprint,
          browser,
          os,
          deviceName,
        }),
      });

      const checkData = await checkResponse.json();

      if (checkData.isDuplicate && checkData.existingSessions?.length > 0) {
        // Show duplicate session modal
        setExistingSessions(checkData.existingSessions);
        setDuplicateSessionModalOpen(true);
        setLoadingDuplicateCheck(false);
        return;
      }

      // No duplicate, proceed with TrustInn access
      setLoadingDuplicateCheck(false);
      await proceedWithTrustInnRedirect();
    } catch (error) {
      console.error('Device fingerprint check failed:', error);
      // Continue anyway if fingerprinting fails
      setLoadingDuplicateCheck(false);
      await proceedWithTrustInnRedirect();
    }
  };

  const proceedWithTrustInnRedirect = async () => {
    try {
      // Get device info for session creation
      const fingerprint = await generateDeviceFingerprint();
      const { deviceId, browser, os, deviceName } = getDeviceInfo();

      // Create session record for current device using JWT session email
      if (userEmail && deviceId && fingerprint) {
        try {
          const sessionCreateResponse = await fetch('/api/auth/session/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              email: userEmail,
              deviceId,
              deviceFingerprint: fingerprint,
              deviceName,
              browser,
              os,
            }),
          });

          if (sessionCreateResponse.ok) {
            console.log('✅ Session created for current device');
          } else {
            console.warn('⚠️ Failed to create session record:', sessionCreateResponse.status);
          }
        } catch (err) {
          console.warn('⚠️ Error creating session record:', err);
          // Continue anyway - this is non-critical
        }
      }

      // Fetch user details to check premium status and trials
      const response = await fetch('/api/user/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch user details:', {
          status: response.status,
          error: errorData,
        });
        
        if (response.status === 401) {
          setTrustInnAccessType('not_logged_in');
          setTrustInnModalOpen(true);
          return;
        }
        
        throw new Error(`Failed to fetch user details: ${response.status}`);
      }

      const userData = await response.json();
      const hasPremium = userData.user?.isPremium;
      const remainingTrials = userData.user?.trialCount || 0;

      console.log('TrustInn access check:', {
        hasPremium,
        remainingTrials,
      });

      setUserTrials(remainingTrials);

      // Check if user has premium or credits available
      if (!hasPremium && remainingTrials <= 0) {
        // No premium and no credits left
        console.warn('User has no premium subscription and no credits remaining');
        setTrustInnAccessType('no_trials');
        setTrustInnModalOpen(true);
        return;
      }

      // User has either premium OR credits - proceed with token generation
      if (hasPremium || remainingTrials > 0) {
        console.log('Generating token for TrustInn access...');
        
        // Generate JWT token
        const tokenResponse = await fetch('/api/auth/generate-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            expiresIn: '7d',
          }),
        });

        if (!tokenResponse.ok) {
          let errorData = {};
          try {
            errorData = await tokenResponse.json();
          } catch (parseError) {
            const errorText = await tokenResponse.text();
            errorData = { error: errorText || 'Unknown error' };
          }
          
          console.error('Token generation failed:', {
            status: tokenResponse.status,
            statusText: tokenResponse.statusText,
            data: errorData,
            jwtSessionData,
            cookies: 'httpOnly cookies (cannot be read from client)',
          });
          
          // If 401, authentication issue
          if (tokenResponse.status === 401) {
            throw new Error('Authentication failed - token generation requires valid session');
          }
          throw new Error(`Failed to generate token: ${tokenResponse.status} - ${errorData.error || 'Unknown error'}`);
        }

        const tokenData = await tokenResponse.json();
        const jwtToken = tokenData.token;

        // Decrement trial if user doesn't have premium
        if (!hasPremium && remainingTrials > 0) {
          console.log(`Decrementing trial count: ${remainingTrials} -> ${remainingTrials - 1}`);
          await fetch('/api/user/me', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              trialCount: remainingTrials - 1,
            }),
          }).catch(err => console.warn('Failed to decrement trials:', err));
        }

        // Build TrustInn URL with JWT token
        const trustInnUrl = new URL('https://trustinn.nitminer.com/tools');
        trustInnUrl.searchParams.append('token', jwtToken);

        console.log('Opening TrustInn in new tab...');
        // Open in new tab instead of redirecting
        window.open(trustInnUrl.toString(), '_blank');
      }
    } catch (error) {
      console.error('Error accessing TrustInn:', {
        message: error?.message,
        stack: error?.stack,
      });
      
      // Default to premium required if other error
      const errorMsg = error?.message || '';
      if (errorMsg.includes('not valid') || errorMsg.includes('Authentication failed')) {
        setTrustInnAccessType('not_logged_in');
      } else {
        setTrustInnAccessType('premium_required');
      }
      
      setTrustInnModalOpen(true);
    }
  };

  const handleTrustInnAccess = async (e) => {
    e.preventDefault();

    // Check if JWT session is still loading
    if (isLoadingSession) {
      console.warn('Session is still loading, please wait...');
      return;
    }

    // Check JWT authentication (not NextAuth)
    if (!isLoggedIn) {
      console.log('JWT authentication check failed:', {
        jwtSessionData,
        isLoggedIn,
      });
      setTrustInnAccessType('not_logged_in');
      setTrustInnModalOpen(true);
      return;
    }

    // Check for duplicate sessions and device fingerprint
    await handleTrustInnAccessWithDuplicateCheck();
  };

  const handleDuplicateSessionConfirm = async () => {
    try {
      // Get current device info
      const { deviceId } = getDeviceInfo();
      
      // Get email from JWT session
      if (!userEmail) {
        console.error('❌ No email available for session invalidation');
        alert('Unable to complete this action. Please try logging in again.');
        setDuplicateSessionModalOpen(false);
        return;
      }

      if (!deviceId) {
        console.error('❌ No device ID available');
        setDuplicateSessionModalOpen(false);
        return;
      }

      console.log('📤 Invalidating other sessions...', { email: userEmail, deviceId });

      // Logout from other sessions but keep this device active
      const response = await fetch('/api/auth/session/invalidate-others', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: userEmail,
          deviceId: deviceId, // Pass current device ID to keep it active
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Other sessions invalidated successfully:', responseData);
        // Now proceed with TrustInn access
        setDuplicateSessionModalOpen(false);
        setExistingSessions([]);
        await proceedWithTrustInnRedirect();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to invalidate sessions:', {
          status: response.status,
          error: errorData,
          email: userEmail,
          deviceId,
        });
        setDuplicateSessionModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to invalidate other sessions:', error);
      setDuplicateSessionModalOpen(false);
    }
  };

  const handleDuplicateSessionCancel = () => {
    setDuplicateSessionModalOpen(false);
    setExistingSessions([]);
    setPendingTrustInnRedirect(null);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setExpandedDropdown(null);
  };

  const toggleDropdown = (dropdownName) => {
    setExpandedDropdown(expandedDropdown === dropdownName ? null : dropdownName);
  };

  return (
    <>
      <header 
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 dark:bg-black/95 backdrop-blur-lg shadow-lg border-b-2 border-blue-500/20' 
            : 'bg-white dark:bg-black border-b border-gray-200 dark:border-zinc-800'
        }`}
        style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}
        suppressHydrationWarning
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 md:h-20">
            
            {/* Logo - Responsive sizing */}
            <Link 
              href="/" 
              className="flex-shrink-0 flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-all duration-300 group"
            >
              <div className="relative">
                <Image
                  src="/images/Logo/logo.png"
                  alt="NitMiner Logo"
                  width={63}
                  height={65}
                  priority
                  className="transition-transform duration-300 group-hover:scale-105 w-10 h-auto sm:w-12 md:w-14 lg:w-auto"
                />
              </div>
              <div className="hidden lg:block">
                <span 
                  className="text-xs sm:text-sm md:text-base lg:text-lg font-black text-gray-900 dark:text-white leading-tight tracking-tight"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                  NITMINER
                  <br />
                  <span className="text-[10px] sm:text-xs md:text-sm lg:text-base font-bold text-blue-600 dark:text-blue-400">
                    Technologies Pvt Ltd.
                  </span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Hidden on tablet and below */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link
                href="/"
                className="px-3 xl:px-4 py-2 text-sm xl:text-base font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300 whitespace-nowrap"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                Home
              </Link>
              <AboutUsDropdown />
              <Link
                href="/services"
                className="px-3 xl:px-4 py-2 text-sm xl:text-base font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300 whitespace-nowrap"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                Services
              </Link>
              <ProductsDropdown onTrustInnClick={handleTrustInnAccess} />
              <Link
                href="/careers"
                className="px-3 xl:px-4 py-2 text-sm xl:text-base font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300 whitespace-nowrap"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                Careers
              </Link>
              <Link
                href="/gallery"
                className="px-3 xl:px-4 py-2 text-sm xl:text-base font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300 whitespace-nowrap"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                Gallery
              </Link>
              <Link
                href="/contact"
                className="px-3 xl:px-4 py-2 text-sm xl:text-base font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300 whitespace-nowrap"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                Contact
              </Link>
            </nav>

            {/* Desktop CTA Button & Theme Toggle - Responsive */}
            <div className="hidden lg:flex flex-shrink-0 items-center gap-2 xl:gap-4">
              <ThemeToggle />
              {isLoggedIn ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 xl:gap-3 px-3 xl:px-5 py-2 xl:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-white/30"
                    style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', letterSpacing: '0.3px' }}
                  >
                    <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <FiUser size={16} className="xl:w-[18px] xl:h-[18px]" />
                    </div>
                    <FiChevronDown 
                      size={14} 
                      className={`transition-transform duration-300 flex-shrink-0 xl:w-4 xl:h-4 ${showProfileMenu ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute top-full mt-3 right-0 bg-white dark:bg-zinc-900 border-2 border-gray-200 dark:border-zinc-700 rounded-xl shadow-2xl z-50 min-w-[260px] xl:min-w-72 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 px-4 xl:px-5 py-3 xl:py-4 border-b-2 border-gray-200 dark:border-zinc-700">
                        <p className="text-sm xl:text-base font-black text-gray-900 dark:text-white mb-1 truncate" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                          {userName || 'User Account'}
                        </p>
                        <p className="text-xs xl:text-sm text-gray-600 dark:text-gray-400 font-medium mb-1 truncate">{userEmail}</p>
                        <div className="inline-flex items-center gap-2 px-2.5 xl:px-3 py-1 bg-blue-600 text-white text-xs font-black rounded-full mt-2" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                          <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                          {userRole.toUpperCase()}
                        </div>
                      </div>
                      <Link
                        href={getDashboardUrl()}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 xl:px-5 py-3 xl:py-4 text-xs xl:text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 border-b border-gray-100 dark:border-zinc-800"
                        style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                      >
                        <svg className="w-4 h-4 xl:w-5 xl:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        DASHBOARD
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 xl:px-5 py-3 xl:py-4 text-xs xl:text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                        style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                      >
                        <FiLogOut size={16} className="xl:w-[18px] xl:h-[18px] flex-shrink-0" />
                        LOGOUT
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="inline-flex items-center gap-1.5 xl:gap-2 px-4 xl:px-6 py-2 xl:py-3 text-xs xl:text-sm font-black rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-white/30 whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', letterSpacing: '0.5px' }}
                >
                  GET STARTED
                  <FiArrowRight size={16} className="xl:w-[18px] xl:h-[18px] flex-shrink-0" />
                </Link>
              )}
            </div>

            {/* Mobile Menu Button & Theme Toggle - Improved spacing */}
            <div className="lg:hidden flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <button
                onClick={toggleMobileMenu}
                className="p-2 sm:p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 active:scale-95"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <FiX size={24} className="sm:w-7 sm:h-7 font-bold" />
                ) : (
                  <FiMenu size={24} className="sm:w-7 sm:h-7 font-bold" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay - Improved animation */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden z-40 animate-fade-in"
            onClick={closeMobileMenu}
          />
        )}

        {/* Mobile Menu - Responsive width */}
        <div
          className={`fixed top-0 left-0 h-full w-[85vw] max-w-sm bg-white dark:bg-black shadow-2xl lg:hidden transition-transform duration-300 transform z-50 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header - Better padding */}
            <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-b-2 border-blue-200 dark:border-blue-800">
              <span 
                className="text-lg sm:text-xl font-black text-gray-900 dark:text-white"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', letterSpacing: '0.5px' }}
              >
                NITMINER
              </span>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 active:scale-95"
                aria-label="Close menu"
              >
                <FiX size={22} className="sm:w-6 sm:h-6 font-bold" />
              </button>
            </div>

            {/* Mobile Menu Items - Improved scrolling */}
            <nav className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-1.5 sm:space-y-2">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="block px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-black text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 active:scale-98"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                HOME
              </Link>

              {/* About Dropdown - Better touch targets */}
              <div>
                <button
                  onClick={() => toggleDropdown('about')}
                  className="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-black text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 active:scale-98"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                  ABOUT
                  <FiChevronDown
                    size={18}
                    className={`sm:w-5 sm:h-5 transition-transform duration-300 flex-shrink-0 ${
                      expandedDropdown === 'about' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedDropdown === 'about' && (
                  <div className="pl-3 sm:pl-4 space-y-1.5 sm:space-y-2 mt-1.5 sm:mt-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 rounded-xl p-2.5 sm:p-3 border-2 border-gray-200 dark:border-zinc-700">
                    <Link
                      href="/team"
                      onClick={closeMobileMenu}
                      className="block px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-400 hover:bg-white dark:hover:bg-zinc-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 active:scale-98"
                      style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                    >
                      Our Team
                    </Link>
                    <Link
                      href="/awards"
                      onClick={closeMobileMenu}
                      className="block px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-400 hover:bg-white dark:hover:bg-zinc-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 active:scale-98"
                      style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                    >
                      Awards
                    </Link>
                    <Link
                      href="/publications"
                      onClick={closeMobileMenu}
                      className="block px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-400 hover:bg-white dark:hover:bg-zinc-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 active:scale-98"
                      style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                    >
                      Publications
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/services"
                onClick={closeMobileMenu}
                className="block px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-black text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 active:scale-98"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                SERVICES
              </Link>

              {/* Products Dropdown */}
              <div>
                <button
                  onClick={() => toggleDropdown('products')}
                  className="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-black text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 active:scale-98"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                  PRODUCTS
                  <FiChevronDown
                    size={18}
                    className={`sm:w-5 sm:h-5 transition-transform duration-300 flex-shrink-0 ${
                      expandedDropdown === 'products' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedDropdown === 'products' && (
                  <div className="pl-3 sm:pl-4 space-y-1.5 sm:space-y-2 mt-1.5 sm:mt-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 rounded-xl p-2.5 sm:p-3 border-2 border-gray-200 dark:border-zinc-700">
                    <Link
                      href="/tools"
                      onClick={closeMobileMenu}
                      className="block px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-400 hover:bg-white dark:hover:bg-zinc-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 active:scale-98"
                      style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                    >
                      Smart Contract Tools
                    </Link>
                    <a
                      href="https://trustinn.nitminer.com/tools"
                      onClick={handleTrustInnAccess}
                      className="block px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-400 hover:bg-white dark:hover:bg-zinc-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 active:scale-98"
                      style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                      target="_blank"
                    >
                      TrustInn
                    </a>
                  </div>
                )}
              </div>

              <Link
                href="/careers"
                onClick={closeMobileMenu}
                className="block px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-black text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 active:scale-98"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                CAREERS
              </Link>
              <Link
                href="/gallery"
                onClick={closeMobileMenu}
                className="block px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-black text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 active:scale-98"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                GALLERY
              </Link>
              <Link
                href="/contact"
                onClick={closeMobileMenu}
                className="block px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-black text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 active:scale-98"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                CONTACT
              </Link>
            </nav>

            {/* Mobile Menu Footer - Better responsiveness */}
            <div className="p-4 sm:p-5 border-t-2 border-gray-200 dark:border-zinc-800 bg-gradient-to-br from-gray-50 to-white dark:from-zinc-950 dark:to-black">
              {isLoggedIn ? (
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="px-4 sm:px-5 py-3 sm:py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                    <p className="text-xs sm:text-sm font-black text-gray-900 dark:text-white mb-1 truncate" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                      {userName || 'User Account'}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium mb-2 truncate">{userEmail}</p>
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-blue-600 text-white text-[10px] sm:text-xs font-black rounded-full" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                      {userRole.toUpperCase()}
                    </div>
                  </div>
                  <Link
                    href={getDashboardUrl()}
                    onClick={closeMobileMenu}
                    className="w-full inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-black rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg transition-all duration-300 active:scale-98"
                    style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', letterSpacing: '0.5px' }}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    DASHBOARD
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-black rounded-xl text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 active:scale-98"
                    style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', letterSpacing: '0.5px' }}
                  >
                    <FiLogOut size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                    LOGOUT
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="w-full inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-black rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg transition-all duration-300 border-2 border-transparent active:scale-98"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', letterSpacing: '0.5px' }}
                >
                  GET STARTED
                  <FiArrowRight size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      <TrustInnAccessModal
        isOpen={trustInnModalOpen}
        onClose={() => setTrustInnModalOpen(false)}
        accessType={trustInnAccessType}
        userEmail={userEmail}
        remainingTrials={userTrials}
      />
      <DuplicateSessionModal
        isOpen={duplicateSessionModalOpen}
        existingSessions={existingSessions}
        onConfirm={handleDuplicateSessionConfirm}
        onCancel={handleDuplicateSessionCancel}
        isLoading={loadingDuplicateCheck}
      />
    </>
  );
}