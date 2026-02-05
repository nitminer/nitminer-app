'use client';

import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiMenu, FiX, FiChevronDown, FiLogOut, FiUser } from 'react-icons/fi';
import { ThemeToggle } from "./theme-toggle";
import { AboutUsDropdown } from "./AboutUsDropdown";
import { ProductsDropdown } from "./ProductsDropdown";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import TrustInnAccessModal from "./TrustInnAccessModal";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedDropdown, setExpandedDropdown] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [trustInnModalOpen, setTrustInnModalOpen] = useState(false);
  const [trustInnAccessType, setTrustInnAccessType] = useState('success');
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const isLoggedIn = !!session;
  const userEmail = session?.user?.email || '';
  const userName = session?.user?.name || '';
  const userRole = session?.user?.role || 'user';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
    setShowProfileMenu(false);
  };

  const getDashboardUrl = () => {
    return userRole === 'admin' ? '/admin/dashboard' : '/dashboard';
  };

  const handleTrustInnAccess = async (e) => {
    e.preventDefault();

    // Check if user is logged in
    if (!isLoggedIn) {
      setTrustInnAccessType('not_logged_in');
      setTrustInnModalOpen(true);
      return;
    }

    try {
      // Fetch user details to check premium status and trials
      const response = await fetch('/api/user/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const userData = await response.json();

      // Check if user has premium or remaining trials
      const hasPremium = userData.user?.isPremium;
      const remainingTrials = userData.user?.trialCount || 0;

      if (!hasPremium && remainingTrials <= 0) {
        setTrustInnAccessType('no_trials');
        setTrustInnModalOpen(true);
        return;
      }

      // If user has premium or trials, allow access and redirect
      if (hasPremium || remainingTrials > 0) {
        // Generate JWT token FIRST
        const tokenResponse = await fetch('/api/auth/generate-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            expiresIn: '7d', // Token valid for 7 days
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to generate token');
        }

        const tokenData = await tokenResponse.json();
        const jwtToken = tokenData.token;

        // Decrement trial if user doesn't have premium (only on initial redirect)
        if (!hasPremium && remainingTrials > 0) {
          await fetch('/api/user/me', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              trialCount: remainingTrials - 1,
            }),
          });
        }

        // Build TrustInn URL with JWT token as query param
        const trustInnUrl = new URL('http://172.20.27.143:4040/tools');
        trustInnUrl.searchParams.append('token', jwtToken);
        trustInnUrl.searchParams.append('user', userData.user?.email);

        // Redirect to TrustInn with JWT token
        window.location.href = trustInnUrl.toString();
      }
    } catch (error) {
      console.error('Error checking TrustInn access:', error);
      setTrustInnAccessType('premium_required');
      setTrustInnModalOpen(true);
    }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a 
              href="/" 
              className="flex-shrink-0 flex items-center gap-3 hover:opacity-80 transition-all duration-300 group"
            >
              <div className="relative">
                <Image
                  src="https://nitminer.com/logo_img/logo-rbg.png"
                  alt="NitMiner Logo"
                  width={62}
                  height={45}
                  priority
                  className="transition-transform duration-300 group-hover:scale-105"
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
              <div className="hidden sm:block">
                <span 
                  className="text-base md:text-lg font-black text-gray-900 dark:text-white leading-tight tracking-tight"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                  NITMINER
                  <br />
                  <span className="text-sm md:text-base font-bold text-blue-600 dark:text-blue-400">
                    Technologies Pvt Ltd.
                  </span>
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <a
                href="/"
                className="px-4 py-2 text-base font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                Home
              </a>
              <AboutUsDropdown />
              <a
                href="/services"
                className="px-4 py-2 text-base font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                Services
              </a>
              <ProductsDropdown onTrustInnClick={handleTrustInnAccess} />
              <a
                href="/careers"
                className="px-4 py-2 text-base font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                Careers
              </a>
              <a
                href="/gallery"
                className="px-4 py-2 text-base font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                Gallery
              </a>
              <a
                href="/contact"
                className="px-4 py-2 text-base font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                Contact
              </a>
            </nav>

            {/* Desktop CTA Button & Theme Toggle */}
            <div className="hidden lg:flex flex-shrink-0 items-center gap-4">
              <ThemeToggle />
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-white/30"
                    style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', letterSpacing: '0.3px' }}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <FiUser size={18} />
                    </div>
                    {/* <span className="hidden xl:inline text-sm uppercase">
                      {userName || userEmail.split('@')[0]}
                    </span> */}
                    <FiChevronDown 
                      size={16} 
                      className={`transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute top-full mt-3 right-0 bg-white dark:bg-zinc-900 border-2 border-gray-200 dark:border-zinc-700 rounded-xl shadow-2xl z-50 min-w-72 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 px-5 py-4 border-b-2 border-gray-200 dark:border-zinc-700">
                        <p className="text-base font-black text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                          {userName || 'User Account'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">{userEmail}</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-xs font-black rounded-full mt-2" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                          <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                          {userRole.toUpperCase()}
                        </div>
                      </div>
                      <Link
                        href={getDashboardUrl()}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-5 py-4 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 border-b border-gray-100 dark:border-zinc-800"
                        style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        DASHBOARD
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-4 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                        style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                      >
                        <FiLogOut size={18} />
                        LOGOUT
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-black rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-white/30"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', letterSpacing: '0.5px' }}
                >
                  GET STARTED
                  <FiArrowRight size={18} />
                </Link>
              )}
            </div>

            {/* Mobile Menu Button & Theme Toggle */}
            <div className="lg:hidden flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={toggleMobileMenu}
                className="p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <FiX size={28} className="font-bold" />
                ) : (
                  <FiMenu size={28} className="font-bold" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden z-40"
            onClick={closeMobileMenu}
          />
        )}

        {/* Mobile Menu */}
        <div
          className={`fixed top-0 left-0 h-full w-80 bg-white dark:bg-black shadow-2xl lg:hidden transition-transform duration-300 transform z-50 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-b-2 border-blue-200 dark:border-blue-800">
              <span 
                className="text-xl font-black text-gray-900 dark:text-white"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', letterSpacing: '0.5px' }}
              >
                MENU
              </span>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                aria-label="Close menu"
              >
                <FiX size={24} className="font-bold" />
              </button>
            </div>

            {/* Mobile Menu Items */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              <a
                href="/"
                onClick={closeMobileMenu}
                className="block px-5 py-3.5 rounded-xl text-base font-black text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                HOME
              </a>

              {/* About Dropdown */}
              <div>
                <button
                  onClick={() => toggleDropdown('about')}
                  className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-base font-black text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                  ABOUT
                  <FiChevronDown
                    size={20}
                    className={`transition-transform duration-300 ${
                      expandedDropdown === 'about' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedDropdown === 'about' && (
                  <div className="pl-4 space-y-2 mt-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 rounded-xl p-3 border-2 border-gray-200 dark:border-zinc-700">
                    <a
                      href="/team"
                      onClick={closeMobileMenu}
                      className="block px-4 py-2.5 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-400 hover:bg-white dark:hover:bg-zinc-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                      style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                    >
                      Our Team
                    </a>
                    <a
                      href="/awards"
                      onClick={closeMobileMenu}
                      className="block px-4 py-2.5 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-400 hover:bg-white dark:hover:bg-zinc-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                      style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                    >
                      Awards
                    </a>
                    <a
                      href="/publications"
                      onClick={closeMobileMenu}
                      className="block px-4 py-2.5 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-400 hover:bg-white dark:hover:bg-zinc-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                      style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                    >
                      Publications
                    </a>
                  </div>
                )}
              </div>

              <a
                href="/services"
                onClick={closeMobileMenu}
                className="block px-5 py-3.5 rounded-xl text-base font-black text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                SERVICES
              </a>

              {/* Products Dropdown */}
              <div>
                <button
                  onClick={() => toggleDropdown('products')}
                  className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-base font-black text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                  PRODUCTS
                  <FiChevronDown
                    size={20}
                    className={`transition-transform duration-300 ${
                      expandedDropdown === 'products' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedDropdown === 'products' && (
                  <div className="pl-4 space-y-2 mt-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 rounded-xl p-3 border-2 border-gray-200 dark:border-zinc-700">
                    <a
                      href="/tools"
                      onClick={closeMobileMenu}
                      className="block px-4 py-2.5 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-400 hover:bg-white dark:hover:bg-zinc-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                      style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                    >
                      Smart Contract Tools
                    </a>
                    <a
                      href="http://172.20.27.143:4040/tools"
                      onClick={handleTrustInnAccess}
                      className="block px-4 py-2.5 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-400 hover:bg-white dark:hover:bg-zinc-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                      style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                    >
                      TrustInn
                    </a>
                  </div>
                )}
              </div>

              <a
                href="/careers"
                onClick={closeMobileMenu}
                className="block px-5 py-3.5 rounded-xl text-base font-black text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                CAREERS
              </a>
              <a
                href="/gallery"
                onClick={closeMobileMenu}
                className="block px-5 py-3.5 rounded-xl text-base font-black text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                GALLERY
              </a>
              <a
                href="/contact"
                onClick={closeMobileMenu}
                className="block px-5 py-3.5 rounded-xl text-base font-black text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                CONTACT
              </a>
            </nav>

            {/* Mobile Menu Footer */}
            <div className="p-5 border-t-2 border-gray-200 dark:border-zinc-800 bg-gradient-to-br from-gray-50 to-white dark:from-zinc-950 dark:to-black">
              {isLoggedIn ? (
                <div className="space-y-3">
                  <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-black text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                      {userName || 'User Account'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">{userEmail}</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-xs font-black rounded-full" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                      {userRole.toUpperCase()}
                    </div>
                  </div>
                  <Link
                    href={getDashboardUrl()}
                    onClick={closeMobileMenu}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-black rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg transition-all duration-300"
                    style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', letterSpacing: '0.5px' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    DASHBOARD
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-black rounded-xl text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300"
                    style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', letterSpacing: '0.5px' }}
                  >
                    <FiLogOut size={18} />
                    LOGOUT
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-black rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg transition-all duration-300 border-2 border-transparent"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', letterSpacing: '0.5px' }}
                >
                  GET STARTED
                  <FiArrowRight size={18} />
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
        remainingTrials={session?.user?.trialCount || 0}
      />
    </>
  );
}