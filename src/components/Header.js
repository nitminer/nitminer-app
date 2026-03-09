'use client';

import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiMenu, FiX, FiChevronDown, FiLogOut, FiCpu, FiLayout, FiImage, FiMail, FiInfo, FiLayers, FiExternalLink } from 'react-icons/fi';
import { AboutUsDropdown } from "./AboutUsDropdown";
import { ProductsDropdown } from "./ProductsDropdown";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import TrustInnAccessModal from "./TrustInnAccessModal";
import DuplicateSessionModal from "./DuplicateSessionModal";
import { generateDeviceFingerprint } from "@/lib/deviceFingerprint";
import AdvertiseBanner from "@/components/AdvertiseBanner"
// ─── class helpers (plain strings — no newlines, no template literals in JSX) ─
const cx = (...args) => args.filter(Boolean).join(' ');

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen]         = useState(false);
  const [expandedDropdown, setExpandedDropdown]     = useState(null);
  const [showProfileMenu, setShowProfileMenu]       = useState(false);
  const [scrolled, setScrolled]                     = useState(false);
  const [trustInnModalOpen, setTrustInnModalOpen]   = useState(false);
  const [trustInnAccessType, setTrustInnAccessType] = useState('success');
  const [userTrials, setUserTrials]                 = useState(0);
  const [duplicateSessionModalOpen, setDuplicateSessionModalOpen] = useState(false);
  const [existingSessions, setExistingSessions]     = useState([]);
  const [loadingDuplicateCheck, setLoadingDuplicateCheck] = useState(false);
  const [isLoggingOut, setIsLoggingOut]             = useState(false);

  const { data: session, status } = useSession();
  const profileMenuRef = useRef(null);

  const isLight = true;

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoggedIn = mounted && status === 'authenticated' && !!session?.user;
  const userEmail  = mounted ? session?.user?.email || '' : '';
  const userName   = mounted ? session?.user?.name  || userEmail?.split('@')[0] || 'User' : 'User';
  const userRole   = mounted ? session?.user?.role  || 'user' : 'user';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target))
        setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getDeviceInfo = () => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Safari') ? 'Safari' : 'Other';
    const os = ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'MacOS' : 'Linux';
    return { browser, os, deviceId: `${browser}-${os}`.toLowerCase(), deviceName: `${os} - ${browser}` };
  };

  const proceedWithTrustInnRedirect = async () => {
    try {
      // Fetch user data
      const res = await fetch('/api/user/me');
      if (!res.ok) {
        console.error('[proceedWithTrustInnRedirect] Failed to fetch user data:', res.status);
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
      
      // Generate token for TrustInn access
      const tokenRes = await fetch('/api/auth/generate-token', { method: 'POST' });
      if (!tokenRes.ok) {
        console.error('[proceedWithTrustInnRedirect] Failed to generate token:', tokenRes.status);
        setTrustInnAccessType('premium_required');
        setTrustInnModalOpen(true);
        return;
      }
      
      const tokenData = await tokenRes.json();
      const token = tokenData?.token;
      
      // Validate token is a valid string
      if (!token || typeof token !== 'string' || token.trim().length === 0) {
        console.error('[proceedWithTrustInnRedirect] Invalid token received:', {
          hasToken: !!token,
          isString: typeof token === 'string',
          length: typeof token === 'string' ? token.length : 0,
          tokenPreview: token ? token.substring(0, 30) : 'null'
        });
        setTrustInnAccessType('premium_required');
        setTrustInnModalOpen(true);
        return;
      }
      
      console.log('[proceedWithTrustInnRedirect] Opening TrustInn with token');
      // Use localhost:3030 for testing, production URL otherwise
      const trustInnUrl = process.env.NEXT_PUBLIC_TRUSTINN_URL || 'https://trustinn.nitminer.com';
      window.open(`${trustInnUrl}/tools?token=${encodeURIComponent(token)}`, '_blank');
    } catch (error) {
      console.error('[proceedWithTrustInnRedirect] Error:', error);
      setTrustInnAccessType('premium_required');
      setTrustInnModalOpen(true);
    }
  };

  const handleTrustInnAccess = async (e) => {
    e?.preventDefault(); setMobileMenuOpen(false);
    if (!isLoggedIn) { setTrustInnAccessType('not_logged_in'); setTrustInnModalOpen(true); return; }
    setLoadingDuplicateCheck(true);
    const fingerprint = await generateDeviceFingerprint();
    const { deviceId, browser, os, deviceName } = getDeviceInfo();
    const checkRes = await fetch('/api/auth/session/check-duplicate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, deviceId, deviceFingerprint: fingerprint, browser, os, deviceName }),
    });
    const checkData = await checkRes.json();
    if (checkData.isDuplicate) { setExistingSessions(checkData.existingSessions); setDuplicateSessionModalOpen(true); }
    else await proceedWithTrustInnRedirect();
    setLoadingDuplicateCheck(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    localStorage.clear(); sessionStorage.clear();
    await signOut({ redirect: false, callbackUrl: '/login' });
    window.location.href = '/login';
  };

  const handleConfirmInvalidate = async () => {
    setLoadingDuplicateCheck(true);
    try {
      const fingerprint = await generateDeviceFingerprint();
      const { deviceId } = getDeviceInfo();
      await fetch('/api/auth/session/invalidate-others', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, deviceId }),
      });
      setDuplicateSessionModalOpen(false);
      await proceedWithTrustInnRedirect();
    } catch (err) { console.error(err); }
    finally { setLoadingDuplicateCheck(false); }
  };

  return (
    <>
      {/* All animations defined in a single <style> block — no JSX className issues */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@700;800;900&display=swap');
        @keyframes hdrGrad { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes hdrDropIn { from{opacity:0;transform:translateY(-10px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes hdrSlide { from{transform:translateX(100%)} to{transform:translateX(0)} }
        .hdr-grad { background:linear-gradient(90deg,#6366f1,#22d3ee,#a78bfa,#6366f1); background-size:300% 100%; animation:hdrGrad 5s ease infinite; }
        .hdr-drop { animation:hdrDropIn .18s ease both; }
        .hdr-slide { animation:hdrSlide .32s cubic-bezier(.32,.72,0,1) both; }
        .hdr-nav-a { position:relative; padding:8px 16px; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; border-radius:12px; color:rgba(31,41,55,.6); transition:all .2s; display:inline-flex; align-items:center; }
        .hdr-nav-a:hover { color:#0f172a; background:rgba(31,41,55,.08); box-shadow:0 0 18px rgba(99,102,241,.12); }
        .hdr-nav-dot { position:absolute; bottom:6px; left:50%; transform:translateX(-50%); width:0; height:2px; border-radius:9999px; background:#6366f1; transition:width .3s; }
        .hdr-nav-a:hover .hdr-nav-dot { width:16px; }
      `}</style>

      {/* Gradient top bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] hdr-grad" />
        
      {/* ── HEADER ── */}
      <header className={cx(
        'fixed top-[2px]  left-0 right-0 w-full z-50 transition-all duration-500',
        isLight
          ? 'bg-white/95 backdrop-blur border-b border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,.08)]'
          : scrolled
          ? 'bg-[#040410]/88 backdrop-blur-2xl border-b border-white/[0.07] shadow-[0_4px_40px_rgba(0,0,0,.5)]'
          : 'bg-[#040410] border-b border-white/[0.05]'
      )}>
        <AdvertiseBanner/>
        {/* ambient glow line */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
          style={{ background: isLight ? 'linear-gradient(90deg,transparent 0%,rgba(99,102,241,.15) 30%,rgba(99,102,241,.1) 70%,transparent 100%)' : 'linear-gradient(90deg,transparent 0%,rgba(99,102,241,.35) 30%,rgba(34,211,238,.25) 70%,transparent 100%)' }}
        />

        {/* 3-col grid: logo | nav | actions */}
        <div className="w-full px-5  xl:px-10 h-[66px] grid items-center gap-4" style={{ gridTemplateColumns: 'auto 1fr auto' }}>

          {/* ── LOGO ── */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'radial-gradient(circle,rgba(99,102,241,.55),transparent)' }}
              />
              <div className={`relative   overflow-hidden  shadow-lg transition-all duration-300 group-hover:scale-105 ${isLight ? 'border-gray-300 group-hover:border-indigo-400/60 group-hover:shadow-[0_0_20px_rgba(99,102,241,.3)]' : 'border-white/10 group-hover:border-indigo-400/60 group-hover:shadow-[0_0_20px_rgba(99,102,241,.45)]'}`}>
                <Image src="/images/Logo/logo.png" alt="Nitminer" width={40} height={40} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span
                className={`text-[16px] md:text-2xl font-black tracking-tight uppercase transition-colors duration-300 group-hover:text-cyan-300 ${isLight ? 'text-gray-900' : 'text-white'}`}
                style={{ fontFamily: "'Exo 2',sans-serif" }}
              >
                NITMINER
              </span>
              <span className={`text-[8px] lg:text-sm font-bold tracking-[.22em] uppercase mt-[3px] ${isLight ? 'text-indigo-500' : 'text-cyan-400/75'}`}>
                Technologies PVT. LTD.
              </span>
            </div>
          </Link>

          {/* ── NAV (centered) ── */}
          <nav className="hidden lg:flex items-center justify-center">
            <div className={`flex items-center gap-0.5 backdrop-blur-xl border px-2 py-1.5 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,.05)] ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/[.04] border-white/[.09]'}`}>
              <a href="/" className="hdr-nav-a"><span className="hdr-nav-dot" />Home</a>
              <NavSep />
              <AboutUsDropdown />
              <NavSep />
              <a href="/services" className="hdr-nav-a"><span className="hdr-nav-dot" />Services</a>
              <NavSep />
              <ProductsDropdown onTrustInnClick={handleTrustInnAccess} />
              <NavSep />
              <a href="/gallery" className="hdr-nav-a"><span className="hdr-nav-dot" />Gallery</a>
              <NavSep />
              <a href="/contact" className="hdr-nav-a"><span className="hdr-nav-dot" />Contact</a>
            </div>
          </nav>

          {/* ── ACTIONS ── */}
          <div className="flex items-center gap-3 justify-end">
            {isLoggedIn ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(v => !v)}
                  className={`flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full backdrop-blur border transition-all duration-300 ${isLight ? 'text-gray-900 bg-gray-100 border-gray-300 hover:border-indigo-400 hover:bg-gray-200 hover:shadow-[0_0_22px_rgba(99,102,241,.2)]' : 'text-white bg-white/[.05] border-white/[.09] hover:border-indigo-400/55 hover:bg-white/[.09] hover:shadow-[0_0_22px_rgba(99,102,241,.3)]'}`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white border"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#22d3ee)', borderColor: 'rgba(255,255,255,0.2)' }}
                  >
                    {userName[0].toUpperCase()}
                  </div>
                  <span className={`text-sm font-bold hidden md:block tracking-wide max-w-[90px] truncate ${isLight ? 'text-gray-700' : 'text-white/85'}`}>{userName}</span>
                  <FiChevronDown size={13} className={cx('transition-transform duration-300', isLight ? 'text-gray-500' : 'text-white/45', showProfileMenu ? 'rotate-180' : '')} />
                </button>

                {showProfileMenu && (
                  <div className={`hdr-drop absolute top-full right-0 mt-3 w-64 z-[200] rounded-2xl overflow-hidden border shadow-lg backdrop-blur-2xl ${isLight ? 'bg-white border-gray-200 shadow-[0_24px_60px_rgba(0,0,0,.1)]' : 'border-white/[.09] shadow-[0_24px_60px_rgba(0,0,0,.65),0_0_40px_rgba(99,102,241,.12)] bg-[#0d0d1c]/96'}`}>
                    {/* user info */}
                    <div
                      className={`p-4 flex items-center gap-3 border-b ${isLight ? 'border-gray-200 bg-gray-50' : 'border-white/[.07] bg-gradient-to-r from-indigo-500/12 to-cyan-500/6'}`}
                    >
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center font-black text-white text-base flex-shrink-0 border"
                        style={{ background: 'linear-gradient(135deg,#6366f1,#22d3ee)', borderColor: 'rgba(255,255,255,0.2)' }}
                      >
                        {userName[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-black text-sm uppercase tracking-wide truncate ${isLight ? 'text-gray-900' : 'text-white'}`} style={{ fontFamily: "'Exo 2',sans-serif" }}>{userName}</p>
                        <p className={`text-[10px] tracking-wide truncate ${isLight ? 'text-gray-500' : 'text-cyan-400/75'}`}>{userEmail}</p>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link
                        href={userRole === 'admin' ? '/admin/dashboard' : '/dashboard'}
                        onClick={() => setShowProfileMenu(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isLight ? 'text-gray-900 hover:bg-indigo-50 hover:text-indigo-700' : 'text-white/85 hover:bg-indigo-500/15 hover:text-white'}`}
                      >
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110 ${isLight ? 'bg-indigo-100 group-hover:bg-indigo-200' : 'bg-indigo-500/15 group-hover:bg-indigo-500/30'}`}>
                          <FiLayout size={14} className={isLight ? 'text-indigo-600' : 'text-indigo-400'} />
                        </span>
                        <span className="text-sm font-bold">Dashboard</span>
                      </Link>
                      <div className="h-px bg-white/[.06] my-1 mx-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 transition-all duration-200 hover:bg-red-500/15 hover:text-red-300 group"
                      >
                        <span className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0 transition-all group-hover:bg-red-500/25 group-hover:scale-110">
                          <FiLogOut size={14} className="text-red-400" />
                        </span>
                        <span className="text-sm font-bold">{isLoggingOut ? 'Signing out…' : 'Sign Out'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs tracking-widest text-white uppercase transition-all duration-300 hover:scale-105 hover:shadow-[0_0_32px_rgba(99,102,241,.55)]"
                style={{ background: 'linear-gradient(135deg,#6366f1,#22d3ee)' }}
              >
                GET STARTED <FiArrowRight size={13} />
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`lg:hidden w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200 ${isLight ? 'bg-gray-200 border-gray-300 text-gray-600 hover:border-indigo-400/55 hover:text-indigo-600 hover:shadow-[0_0_16px_rgba(99,102,241,.2)]' : 'bg-white/[.05] border-white/[.09] text-white/65 hover:border-indigo-400/55 hover:text-cyan-400 hover:shadow-[0_0_16px_rgba(99,102,241,.28)]'}`}
            >
              <FiMenu size={19} />
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE DRAWER ── */}
      <div className={cx('fixed inset-0 z-[100]', mobileMenuOpen ? 'visible' : 'invisible pointer-events-none')}>
        <div
          onClick={() => setMobileMenuOpen(false)}
          className={cx('absolute inset-0 backdrop-blur-sm transition-opacity duration-300', mobileMenuOpen ? 'opacity-100' : 'opacity-0', isLight ? 'bg-black/30' : 'bg-black/70')}
        />

        <div className={cx('hdr-slide absolute right-0 top-0 h-full w-[88%] max-w-[340px] flex flex-col border-l shadow-[-16px_0_80px_rgba(0,0,0,.7)] transition-colors duration-500', isLight ? 'bg-white border-gray-200' : 'bg-[#07071a] border-white/[.07]', !mobileMenuOpen ? 'translate-x-full' : '')}>
          <div className="absolute top-0 left-0 right-0 h-[2px] hdr-grad" />

          {/* drawer header */}
          <div
            className={`flex items-center justify-between px-5 py-4 border-b flex-shrink-0 transition-colors duration-500 ${isLight ? 'border-gray-200 bg-gray-50' : 'border-white/[.07] bg-gradient-to-r from-indigo-500/12 to-cyan-500/6'}`}
          >
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl overflow-hidden border shadow ${isLight ? 'border-gray-300' : 'border-white/15'}`}>
                <Image src="/images/Logo/logo.png" alt="Logo" width={32} height={32} className="w-full h-full object-cover" />
              </div>
              <div className="leading-none">
                <p className={`font-black text-sm uppercase tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`} style={{ fontFamily: "'Exo 2',sans-serif" }}>NITMINER</p>
                <p className={`text-[8px] font-bold tracking-[.18em] uppercase mt-0.5 ${isLight ? 'text-indigo-500' : 'text-cyan-400/75'}`}>Technologies</p>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 ${isLight ? 'bg-gray-200 border-gray-300 text-gray-600 hover:bg-red-100 hover:text-red-600 hover:border-red-300' : 'bg-white/[.05] border-white/[.09] text-white/45 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40'}`}
            >
              <FiX size={17} />
            </button>
          </div>

          {/* drawer nav */}
          <nav className={`flex-1 px-4 py-4 overflow-y-auto space-y-1.5 ${isLight ? 'text-gray-900' : 'text-white'}`}>
            <DrawerLink href="/" label="Home" icon={<FiLayout />} onClick={() => setMobileMenuOpen(false)} isLight={isLight} />

            <DrawerAccordion id="about" label="About Us" icon={<FiInfo />} expanded={expandedDropdown} setExpanded={setExpandedDropdown} isLight={isLight}>
              {[
                { href: '/about-us', label: 'Mission' },
                { href: '/team', label: 'Team' },
                { href: '/publications', label: 'Research' },
              ].map(item => (
                <DrawerSubLink key={item.href} href={item.href} label={item.label} onClick={() => setMobileMenuOpen(false)} isLight={isLight} />
              ))}
            </DrawerAccordion>

            <DrawerLink href="/services" label="Services" icon={<FiCpu />} onClick={() => setMobileMenuOpen(false)} isLight={isLight} />

            <DrawerAccordion id="products" label="Products" icon={<FiLayers />} expanded={expandedDropdown} setExpanded={setExpandedDropdown} isLight={isLight}>
              <button
                onClick={handleTrustInnAccess}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-black uppercase tracking-tight transition-all w-full ${isLight ? 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50' : 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10'}`}
              >
                <FiExternalLink size={11} className="flex-shrink-0" />
                TrustInn Dashboard
              </button>
            </DrawerAccordion>

            <DrawerLink href="/gallery" label="Gallery" icon={<FiImage />} onClick={() => setMobileMenuOpen(false)} isLight={isLight} />
            <DrawerLink href="/contact" label="Contact" icon={<FiMail />} onClick={() => setMobileMenuOpen(false)} isLight={isLight} />
            <DrawerLink href="/awards" label="Awards" icon={<FiInfo />} onClick={() => setMobileMenuOpen(false)} isLight={isLight} />
            <DrawerLink href="/careers" label="Careers" icon={<FiInfo />} onClick={() => setMobileMenuOpen(false)} isLight={isLight} />
          </nav>

          {/* drawer footer */}
          <div className={`px-4 pb-6 pt-4 border-t flex-shrink-0 space-y-3 ${isLight ? 'border-gray-300' : 'border-white/[.07]'}`}>
            {isLoggedIn ? (
              <>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-colors duration-300 ${isLight ? 'bg-indigo-50 border-indigo-300' : 'border-indigo-500/25 bg-gradient-to-r from-indigo-500/10 to-cyan-500/5'}`}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0 border" style={{ background: 'linear-gradient(135deg,#6366f1,#22d3ee)', borderColor: 'rgba(255,255,255,0.2)' }}>
                    {userName[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-black text-sm uppercase truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>{userName}</p>
                    <p className={`text-[10px] truncate ${isLight ? 'text-gray-600' : 'text-cyan-400/75'}`}>{userEmail}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className={`w-full py-3.5 rounded-2xl font-black uppercase text-sm tracking-wide flex items-center justify-center gap-2 border transition-all duration-300 ${isLight ? 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300' : 'text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40'}`}
                >
                  <FiLogOut size={15} />
                  {isLoggingOut ? 'Signing out…' : 'Sign Out'}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${isLight ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:shadow-[0_0_32px_rgba(99,102,241,.3)]' : 'text-white hover:shadow-[0_0_32px_rgba(99,102,241,.5)]'}`}
                style={!isLight ? { background: 'linear-gradient(135deg,#6366f1,#22d3ee)' } : {}}
              >
                GET STARTED <FiArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>

      <TrustInnAccessModal isOpen={trustInnModalOpen} onClose={() => setTrustInnModalOpen(false)} accessType={trustInnAccessType} userEmail={userEmail} remainingTrials={userTrials} />
      <DuplicateSessionModal isOpen={duplicateSessionModalOpen} existingSessions={existingSessions} onConfirm={handleConfirmInvalidate} onCancel={() => setDuplicateSessionModalOpen(false)} isLoading={loadingDuplicateCheck} />
    </>
  );
}

/* ── sub-components — all classNames are plain single-line strings ── */

function NavSep() {
  return <span className="w-px h-4 bg-white/[.07] flex-shrink-0 mx-1" />;
}

function DrawerLink({ href, label, icon, onClick, isLight }) {
  return (
    <Link href={href} onClick={onClick} className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border font-bold uppercase text-sm tracking-wide transition-all duration-200 group ${isLight ? 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-indigo-100 hover:border-indigo-300 hover:text-indigo-700 hover:shadow-[0_0_16px_rgba(99,102,241,.15)]' : 'bg-white/[.03] border-white/[.07] text-white/65 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-white hover:shadow-[0_0_16px_rgba(99,102,241,.18)]'}`}>
      <span className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110 ${isLight ? 'bg-gray-200 border-gray-300 text-indigo-600 group-hover:bg-indigo-200 group-hover:text-indigo-700 group-hover:border-indigo-400' : 'bg-white/[.05] border-white/[.07] text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-cyan-400 group-hover:border-indigo-500/35'}`}>
        {icon}
      </span>
      {label}
    </Link>
  );
}

function DrawerAccordion({ id, label, icon, expanded, setExpanded, children, isLight }) {
  const isOpen = expanded === id;
  const openCls = isLight ? 'bg-indigo-100 border-indigo-300 text-indigo-700 shadow-[0_0_20px_rgba(99,102,241,.1)]' : 'bg-indigo-500/10 border-indigo-500/30 text-white shadow-[0_0_20px_rgba(99,102,241,.15)]';
  const closeCls = isLight ? 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700' : 'bg-white/[.03] border-white/[.07] text-white/65 hover:bg-indigo-500/[.06] hover:border-indigo-500/[.18] hover:text-white';
  const iconOpenCls = isLight ? 'bg-indigo-200 border-indigo-400 text-indigo-700 shadow-[0_0_12px_rgba(99,102,241,.2)]' : 'bg-indigo-500/25 border-indigo-500/45 text-cyan-400 shadow-[0_0_12px_rgba(99,102,241,.28)]';
  const iconCloseCls = isLight ? 'bg-gray-200 border-gray-300 text-indigo-600' : 'bg-white/[.05] border-white/[.07] text-indigo-400';
  return (
    <div>
      <button
        onClick={() => setExpanded(isOpen ? null : id)}
        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border font-bold text-sm uppercase tracking-wide transition-all duration-200 ${isOpen ? openCls : closeCls}`}
      >
        <div className="flex items-center gap-3.5">
          <span className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all duration-200 ${isOpen ? iconOpenCls : iconCloseCls}`}>
            {icon}
          </span>
          {label}
        </div>
        <FiChevronDown size={15} className={`transition-transform duration-300 ${isOpen ? `rotate-180 ${isLight ? 'text-indigo-600' : 'text-cyan-400'}` : isLight ? 'text-gray-400' : 'text-white/25'}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-48 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
        <div className={`ml-4 pl-5 py-1 space-y-0.5 border-l-2 ${isLight ? 'border-indigo-300' : 'border-indigo-500/30'}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

function DrawerSubLink({ href, label, onClick, isLight }) {
  return (
    <Link href={href} onClick={onClick} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isLight ? 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50' : 'text-white/45 hover:text-cyan-400 hover:bg-cyan-500/[.08]'}`}>
      <FiArrowRight size={11} className={`flex-shrink-0 ${isLight ? 'text-indigo-500' : 'text-indigo-400/70'}`} />
      {label}
    </Link>
  );
}