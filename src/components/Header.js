'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  FiChevronDown,
  FiExternalLink,
  FiLogOut,
  FiMenu,
  FiX,
} from 'react-icons/fi';
import { AboutUsDropdown } from './AboutUsDropdown';
import { ProductsDropdown } from './ProductsDropdown';
import TrustInnAccessModal from './TrustInnAccessModal';
import DuplicateSessionModal from './DuplicateSessionModal';
import { generateDeviceFingerprint } from '@/lib/deviceFingerprint';

const cx = (...args) => args.filter(Boolean).join(' ');

export default function Header() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [trustInnModalOpen, setTrustInnModalOpen] = useState(false);
  const [trustInnAccessType, setTrustInnAccessType] = useState('success');
  const [userTrials, setUserTrials] = useState(0);
  const [duplicateSessionModalOpen, setDuplicateSessionModalOpen] = useState(false);
  const [existingSessions, setExistingSessions] = useState([]);
  const [loadingDuplicateCheck, setLoadingDuplicateCheck] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: session, status } = useSession();
  const profileMenuRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onMouseDown = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const isLoggedIn = mounted && status === 'authenticated' && !!session?.user;
  const userEmail = mounted ? session?.user?.email || '' : '';
  const userName = mounted
    ? session?.user?.name || userEmail.split('@')[0] || 'User'
    : 'User';
  const userRole = mounted ? session?.user?.role || 'user' : 'user';

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileAboutOpen(false);
    setMobileProductsOpen(false);
  };

  const getDeviceInfo = () => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const browser = ua.includes('Chrome')
      ? 'Chrome'
      : ua.includes('Safari')
        ? 'Safari'
        : 'Other';
    const os = ua.includes('Windows')
      ? 'Windows'
      : ua.includes('Mac')
        ? 'MacOS'
        : 'Linux';

    return {
      browser,
      os,
      deviceId: `${browser}-${os}`.toLowerCase(),
      deviceName: `${os} - ${browser}`,
    };
  };

  const proceedWithTrustInnRedirect = async () => {
    try {
      const res = await fetch('/api/user/me');
      if (!res.ok) {
        setTrustInnAccessType('premium_required');
        setTrustInnModalOpen(true);
        return;
      }

      const userData = await res.json();
      const hasPremium = userData.user?.isPremium;
      const remainingTrials = userData.user?.trialCount || 0;
      setUserTrials(remainingTrials);

      if (!hasPremium && remainingTrials <= 0) {
        setTrustInnAccessType('no_trials');
        setTrustInnModalOpen(true);
        return;
      }

      const tokenRes = await fetch('/api/auth/generate-token', { method: 'POST' });
      if (!tokenRes.ok) {
        setTrustInnAccessType('premium_required');
        setTrustInnModalOpen(true);
        return;
      }

      const tokenData = await tokenRes.json();
      const token = tokenData?.token;

      if (!token || typeof token !== 'string') {
        setTrustInnAccessType('premium_required');
        setTrustInnModalOpen(true);
        return;
      }

      const trustInnUrl = new URL('https://trustinn.nitminer.com/tools');
      if (token) {
        trustInnUrl.searchParams.set('token', token);
      }
      window.location.href = trustInnUrl.toString();
    } catch (error) {
      console.error('[Header] TrustInn redirect failed:', error);
      setTrustInnAccessType('premium_required');
      setTrustInnModalOpen(true);
    }
  };

  const handleTrustInnAccess = async (event) => {
    event?.preventDefault();
    closeMobileMenu();

    if (!isLoggedIn) {
      setTrustInnAccessType('not_logged_in');
      setTrustInnModalOpen(true);
      return;
    }

    setLoadingDuplicateCheck(true);

    try {
      const fingerprint = await generateDeviceFingerprint();
      const { deviceId, browser, os, deviceName } = getDeviceInfo();

      const checkRes = await fetch('/api/auth/session/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          deviceId,
          deviceFingerprint: fingerprint,
          browser,
          os,
          deviceName,
        }),
      });

      const checkData = await checkRes.json();

      if (checkData.isDuplicate) {
        setExistingSessions(checkData.existingSessions);
        setDuplicateSessionModalOpen(true);
      } else {
        await proceedWithTrustInnRedirect();
      }
    } catch (error) {
      console.error('[Header] Duplicate session check failed:', error);
      setTrustInnAccessType('premium_required');
      setTrustInnModalOpen(true);
    } finally {
      setLoadingDuplicateCheck(false);
    }
  };

  const handleConfirmInvalidate = async () => {
    setLoadingDuplicateCheck(true);
    try {
      const { deviceId } = getDeviceInfo();
      await fetch('/api/auth/session/invalidate-others', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, deviceId }),
      });
      setDuplicateSessionModalOpen(false);
      await proceedWithTrustInnRedirect();
    } catch (error) {
      console.error('[Header] Invalidate sessions failed:', error);
    } finally {
      setLoadingDuplicateCheck(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    localStorage.clear();
    sessionStorage.clear();
    await signOut({ redirect: false, callbackUrl: '/login' });
    window.location.href = '/login';
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-purple-200 bg-gray-950 py-2 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between px-4 md:px-10">
          <Link href="/" className="group flex items-center gap-2">
            <Image
              src="/images/Logo/logo.png"
              alt="NITMiner Technologies Logo"
              width={48}
              height={48}
              className="w-10 object-contain md:w-12"
            />
            <h3 className="text-lg font-bold tracking-wide transition-colors duration-300 group-hover:text-purple-400 md:text-xl">
              NITMiner
            </h3>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="rounded border border-dashed border-purple-400 px-2 py-1 text-purple-300 md:hidden"
            aria-label="Open menu"
          >
            <FiMenu size={20} />
          </button>

          <div className="hidden items-center gap-7 md:flex">
            <ul className="flex items-center gap-7 font-serif text-sm text-gray-100">
              <li>
                <Link className="transition hover:text-purple-300" href="/">
                  Home
                </Link>
              </li>
              <li>
                <AboutUsDropdown />
              </li>
              <li>
                <Link className="transition hover:text-purple-300" href="/services">
                  Services
                </Link>
              </li>
              <li>
                <ProductsDropdown onTrustInnClick={handleTrustInnAccess} />
              </li>
              <li>
                <Link className="transition hover:text-purple-300" href="/gallery">
                  Gallery
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-purple-300" href="/contact">
                  Contact
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-purple-300" href="/downloads">
                  Download
                </Link>
              </li>
            </ul>

            {isLoggedIn ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-gray-700 bg-gray-900 px-3 py-2 text-sm transition hover:border-purple-400 hover:text-purple-300"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 font-bold text-white">
                    {userName[0]?.toUpperCase()}
                  </span>
                  <span className="max-w-[110px] truncate">{userName}</span>
                  <FiChevronDown
                    className={cx(
                      'transition-transform duration-300',
                      showProfileMenu && 'rotate-180'
                    )}
                    size={16}
                  />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-3 w-60 rounded-xl border border-gray-700 bg-gray-900 p-2 shadow-2xl">
                    <div className="border-b border-gray-700 px-3 py-3">
                      <p className="truncate text-sm font-semibold text-white">
                        {userName}
                      </p>
                      <p className="truncate text-xs text-gray-400">{userEmail}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setShowProfileMenu(false)}
                      className="mt-2 block rounded-lg px-3 py-2 text-sm text-gray-200 transition hover:bg-gray-800 hover:text-purple-300"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                    >
                      <FiLogOut size={15} />
                      {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-600"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <div
        className={cx(
          'fixed inset-0 z-[80] md:hidden',
          mobileMenuOpen ? 'visible' : 'invisible pointer-events-none'
        )}
      >
        <button
          aria-label="Close menu overlay"
          className={cx(
            'absolute inset-0 bg-black/60 transition-opacity',
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={closeMobileMenu}
        />

        <div
          className={cx(
            'absolute left-0 top-0 h-screen w-full transform bg-gray-900 text-white transition-transform duration-300 ease-in-out',
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <Image
                src="/images/Logo/logo.png"
                alt="NITMiner Technologies Logo"
                width={48}
                height={48}
                className="w-12 object-contain"
              />
              <span className="text-lg font-bold tracking-wide">NITMiner</span>
            </div>
            <button
              onClick={closeMobileMenu}
              className="rounded border border-dashed border-purple-400 p-2 text-purple-300"
              aria-label="Close menu"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="mx-auto h-1 w-80 rounded-2xl bg-gradient-to-tr from-sky-400 to-purple-500" />

          <ul className="mx-5 mt-6 flex flex-col gap-5 rounded-lg border border-gray-700 p-6 text-lg">
            <MobileMenuLink href="/" label="Home" onClick={closeMobileMenu} />

            <li className="w-full rounded-lg border border-gray-700 p-2">
              <button
                onClick={() => {
                  setMobileAboutOpen((prev) => !prev);
                  setMobileProductsOpen(false);
                }}
                className="flex w-full items-center justify-between py-2"
              >
                <span>About Us</span>
                <FiChevronDown
                  className={cx(
                    'transition-transform duration-300',
                    mobileAboutOpen && 'rotate-180'
                  )}
                />
              </button>
              <div
                className={cx(
                  'overflow-hidden transition-all duration-300 ease-in-out',
                  mobileAboutOpen ? 'mt-3 max-h-72' : 'max-h-0'
                )}
              >
                <div className="flex flex-col gap-3 rounded-xl border-l-2 border-gray-500 bg-gray-800 p-4">
                  <MobileSubLink href="/about-us" label="About Us" onClick={closeMobileMenu} />
                  <MobileSubLink href="/team" label="Our Team" onClick={closeMobileMenu} />
                  <MobileSubLink href="/awards" label="Awards" onClick={closeMobileMenu} />
                  <MobileSubLink
                    href="/publications"
                    label="Publications"
                    onClick={closeMobileMenu}
                  />
                  <MobileSubLink href="/pricing" label="Pricing" onClick={closeMobileMenu} />
                </div>
              </div>
            </li>

            <MobileMenuLink
              href="/services"
              label="Services"
              onClick={closeMobileMenu}
            />

            <li className="w-full rounded-lg border border-gray-700 p-2">
              <button
                onClick={() => {
                  setMobileProductsOpen((prev) => !prev);
                  setMobileAboutOpen(false);
                }}
                className="flex w-full items-center justify-between py-2"
              >
                <span>Products</span>
                <FiChevronDown
                  className={cx(
                    'transition-transform duration-300',
                    mobileProductsOpen && 'rotate-180'
                  )}
                />
              </button>
              <div
                className={cx(
                  'overflow-hidden transition-all duration-300 ease-in-out',
                  mobileProductsOpen ? 'mt-3 max-h-52' : 'max-h-0'
                )}
              >
                <div className="flex flex-col gap-3 rounded-xl border-l-2 border-gray-500 bg-gray-800 p-4">
                  <button
                    onClick={handleTrustInnAccess}
                    className="flex items-center gap-2 border-b border-gray-700 pb-2 text-left transition hover:text-purple-300"
                  >
                    <FiExternalLink size={14} />
                    TrustInn
                  </button>
                  <MobileSubLink href="/verisol" label="VeriSol" onClick={closeMobileMenu} />
                </div>
              </div>
            </li>

            <MobileMenuLink href="/gallery" label="Gallery" onClick={closeMobileMenu} />
            <MobileMenuLink href="/contact" label="Contact" onClick={closeMobileMenu} />
            <MobileMenuLink href="/downloads" label="Download" onClick={closeMobileMenu} />
          </ul>

          <div className="mx-5 mt-6 border-t border-gray-700 pt-6">
            {isLoggedIn ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
                  <p className="truncate text-sm font-semibold">{userName}</p>
                  <p className="truncate text-xs text-gray-400">{userEmail}</p>
                </div>
                <Link
                  href="/dashboard"
                  onClick={closeMobileMenu}
                  className="block rounded-lg border border-gray-700 px-4 py-3 text-center transition hover:border-purple-400 hover:text-purple-300"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-500 px-4 py-3 font-semibold text-white transition hover:bg-purple-600"
                >
                  <FiLogOut size={15} />
                  {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="block rounded-lg bg-purple-500 px-4 py-3 text-center font-semibold text-white transition hover:bg-purple-600"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

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
        onConfirm={handleConfirmInvalidate}
        onCancel={() => setDuplicateSessionModalOpen(false)}
        isLoading={loadingDuplicateCheck}
      />
    </>
  );
}

function MobileMenuLink({ href, label, onClick }) {
  return (
    <li className="w-fit rounded-lg border border-gray-700 p-2">
      <Link href={href} onClick={onClick}>
        {label}
      </Link>
    </li>
  );
}

function MobileSubLink({ href, label, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="border-b border-gray-700 pb-2 transition hover:text-purple-300"
    >
      {label}
    </Link>
  );
}
