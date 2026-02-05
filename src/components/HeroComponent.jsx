'use client';

import Link from "next/link";
import Image from "next/image";
import { FiArrowRight, FiUser, FiShield, FiCpu, FiCode } from 'react-icons/fi';
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const AnimatedCounter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    const startValue = 0;

    const animateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(progress * (end - startValue) + startValue));
        requestAnimationFrame(animateCount);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animateCount);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
};

export default function HeroComponent() {
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const userName = session?.user?.name || '';
  const userEmail = session?.user?.email || '';
  const userRole = session?.user?.role || 'user';
  const dashboardLink = userRole === 'admin' ? '/admin/dashboard' : '/dashboard';

  return (
    <>
      
      <section className="bg-gradient-to-b from-slate-50 to-blue-50/30 dark:from-zinc-950 dark:to-blue-950/10 py-12 sm:py-16 lg:py-24" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Left Content */}
            <div>
              {/* Badge */}
              {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-800 rounded-full mb-6 animate-fade-in shadow-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-wide" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  ABOUT US
                </span>
              </div> */}

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight animate-fade-in animation-delay-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Leading Technology{" "}
                <span className="text-blue-600 dark:text-blue-400 font-black">
                  Innovators
                </span>
              </h1>
           
              <p className="mt-6 text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed animate-fade-in animation-delay-2 font-medium">
                <span className="font-black text-xl text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  NITMINER Technologies
                </span>
                {" "}is at the forefront of blockchain and AI innovation, delivering cutting-edge solutions that transform businesses and drive digital evolution.
              </p>

            {/* Feature Highlights */}
            {/* <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-in-up animation-delay-3">
              <div className="flex items-start gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border-2 border-gray-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-lg">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <FiShield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-base font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Blockchain Excellence
                  </div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                    Industry-leading blockchain development and smart contract solutions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border-2 border-gray-200 dark:border-zinc-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 hover:shadow-lg">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <FiCpu className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-base font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    AI & ML Solutions
                  </div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                    Advanced artificial intelligence and machine learning applications.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border-2 border-gray-200 dark:border-zinc-800 hover:border-green-500 dark:hover:border-green-500 transition-all duration-300 hover:shadow-lg">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <FiCode className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-base font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Cloud Services
                  </div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                    Scalable and secure cloud infrastructure solutions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border-2 border-gray-200 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 hover:shadow-lg">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <div className="text-base font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Security First
                  </div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                    Enterprise-grade security and compliance solutions.
                  </p>
                </div>
              </div>
            </div> */}

            {/* CTA Buttons */}
            <div className="mt-10 lg:mt-12">
              {isLoggedIn ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Link 
                    href={dashboardLink}
                    className="inline-flex items-center justify-center px-8 py-4 font-bold text-base text-white transition-all duration-200 bg-blue-600 rounded-xl hover:bg-blue-700 focus:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-1 animate-bounce-in animation-delay-4 border-2 border-blue-700 hover:border-blue-800"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    <FiUser className="w-5 h-5 mr-2" />
                    {userRole === 'admin' ? 'ADMIN DASHBOARD' : 'GO TO DASHBOARD'}
                    <FiArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      Welcome back,{" "}
                      <span className="font-black text-blue-600 dark:text-blue-400">
                        {userName || userEmail.split('@')[0]}
                      </span>
                      {userRole === 'admin' && <span className="ml-2 px-2 py-0.5 bg-red-600 text-white text-xs font-black rounded">ADMIN</span>}
                    </p>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 mt-0.5">
                      Access your {userRole === 'admin' ? 'admin ' : ''}dashboard
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/services" 
                    className="inline-flex items-center justify-center px-8 py-4 font-black text-base text-white transition-all duration-200 bg-blue-600 rounded-xl hover:bg-blue-700 focus:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-1 animate-bounce-in animation-delay-4 border-2 border-blue-700 hover:border-blue-800"
                    style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.5px' }}
                  >
                    EXPLORE PRODUCTS
                    <FiArrowRight className="w-5 h-5 ml-3" />
                  </Link>
                  <Link 
                    href="/contact" 
                    className="inline-flex items-center justify-center px-8 py-4 font-bold text-base text-gray-900 dark:text-gray-100 transition-all duration-200 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-700 rounded-xl hover:border-blue-600 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:-translate-y-1 hover:shadow-lg animate-bounce-in animation-delay-4"
                    style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.5px' }}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    CONTACT US
                  </Link>
                </div>
              )}

              {!isLoggedIn && (
                <p className="mt-5 text-sm font-semibold text-gray-600 dark:text-gray-400 animate-fade-in animation-delay-5">
                  Want to join our team?{" "}
                  <Link 
                    href="/careers" 
                    className="text-blue-600 dark:text-blue-400 transition-all duration-200 hover:underline font-bold"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    View Careers →
                  </Link>
                </p>
              )}
            </div>

            {/* Vision & Mission */}
            {/* <div className="mt-10 pt-8 border-t-2 border-gray-200 dark:border-zinc-800 animate-fade-in animation-delay-5">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                OUR VISION & MISSION
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-600 dark:border-blue-500 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-black text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        VISION
                      </h4>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                        To revolutionize the blockchain ecosystem by becoming the leader in smart contract testing automation, ensuring security, efficiency, and trust in decentralized applications.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border-l-4 border-purple-600 dark:border-purple-500 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-black text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        MISSION
                      </h4>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                        At NITMINER, we empower blockchain developers and enterprises by delivering cutting-edge automated testing solutions, enhancing reliability and performance through seamless, scalable, and highly secure processes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Featured Product Banner */}
            <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl animate-fade-in animation-delay-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-black rounded" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>FEATURED</span>
                    <h3 className="text-base font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.3px' }}>
                      TRUSTINN PLATFORM
                    </h3>
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-gray-700 dark:text-gray-400 leading-relaxed">
                    Advanced security platform providing comprehensive testing and certification for smart contracts with enterprise-grade security features.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-1 bg-white dark:bg-zinc-800 text-xs font-bold text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-zinc-700">Security Testing</span>
                    <span className="px-2 py-1 bg-white dark:bg-zinc-800 text-xs font-bold text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-zinc-700">Smart Contracts</span>
                    <span className="px-2 py-1 bg-white dark:bg-zinc-800 text-xs font-bold text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-zinc-700">Automation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex justify-center lg:justify-end animate-fade-in animation-delay-2">
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob"></div>
              <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob animation-delay-2"></div>
              
              <div className="relative">
                <Image
                  src="/images/hero/hero.png"
                  alt="TrustInn Security Analysis Platform"
                  width={600}
                  height={600}
                  priority
                  className="relative z-10 rounded-2xl shadow-2xl"
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}