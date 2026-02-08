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
      <section 
        className="relative bg-gradient-to-b from-slate-50 to-blue-50/30 dark:from-zinc-950 dark:to-blue-950/10 py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 overflow-hidden" 
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* Decorative Background Elements - Responsive sizes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-8 sm:top-12 -right-20 sm:-right-32 w-40 sm:w-64 h-40 sm:h-64 bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 sm:-bottom-32 -left-20 sm:-left-32 w-48 sm:w-80 h-48 sm:h-80 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
          <div className="grid items-center grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 xl:gap-20">
            
            {/* Left Content */}
            <div className="flex flex-col justify-center space-y-4 sm:space-y-6 lg:space-y-8 order-2 lg:order-1">
              
              {/* Heading - Responsive text sizes */}
              <h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black text-gray-900 dark:text-white leading-tight sm:leading-tight tracking-tight" 
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Leading Technology{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent font-black">
                  Innovators
                </span>
              </h1>
           
              {/* Description - Responsive spacing and sizing */}
              <div className="space-y-2 sm:space-y-3">
                <p 
                  className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white" 
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  NITMINER Technologies
                </p>
                <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium max-w-full lg:max-w-lg">
                  is at the forefront of blockchain and AI innovation, delivering cutting-edge solutions that transform businesses and drive digital evolution.
                </p>
              </div>

              {/* CTA Buttons - Improved mobile layout */}
              <div className="pt-2 sm:pt-4">
                {isLoggedIn ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                    <Link 
                      href={dashboardLink}
                      className="inline-flex items-center justify-center px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 font-bold text-sm sm:text-base text-white transition-all duration-200 bg-blue-600 rounded-xl hover:bg-blue-700 focus:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 border-2 border-blue-700 hover:border-blue-800 w-full sm:w-auto whitespace-nowrap"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      <FiUser className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                      <span className="truncate text-xs sm:text-sm md:text-base">
                        {userRole === 'admin' ? 'ADMIN DASHBOARD' : 'GO TO DASHBOARD'}
                      </span>
                      <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 flex-shrink-0" />
                    </Link>
                    
                    <div className="text-left w-full sm:w-auto px-1 sm:px-0">
                      <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        Welcome back,{" "}
                        <span className="font-black text-blue-600 dark:text-blue-400 break-all sm:break-normal">
                          {userName || userEmail.split('@')[0]}
                        </span>
                        {userRole === 'admin' && (
                          <span className="ml-2 px-2 py-0.5 bg-red-600 text-white text-xs font-black rounded inline-block">
                            ADMIN
                          </span>
                        )}
                      </p>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 mt-1">
                        Access your {userRole === 'admin' ? 'admin ' : ''}dashboard
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Link 
                        href="/services" 
                        className="inline-flex items-center justify-center px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 font-black text-sm sm:text-base text-white transition-all duration-200 bg-blue-600 rounded-xl hover:bg-blue-700 focus:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 border-2 border-blue-700 hover:border-blue-800 w-full sm:w-auto"
                        style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.5px' }}
                      >
                        EXPLORE
                        <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3 flex-shrink-0" />
                      </Link>
                      
                      <Link 
                        href="/contact" 
                        className="inline-flex items-center justify-center px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 transition-all duration-200 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-700 rounded-xl hover:border-blue-600 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:-translate-y-0.5 hover:shadow-lg w-full sm:w-auto"
                        style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.5px' }}
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        CONTACT US
                      </Link>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 px-1">
                      Want to join our team?{" "}
                      <Link 
                        href="/careers" 
                        className="text-blue-600 dark:text-blue-400 transition-all duration-200 hover:underline font-bold"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      >
                        View Careers →
                      </Link>
                    </p>
                  </div>
                )}
              </div>

              {/* Featured Product Banner - Better mobile padding */}
              <div className="p-3 sm:p-4 md:p-5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-black rounded flex-shrink-0" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        FEATURED
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.3px' }}>
                        TRUSTINN PLATFORM
                      </h3>
                    </div>
                    
                    <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-400 leading-relaxed mb-2 sm:mb-3">
                      Advanced security platform for smart contracts with enterprise-grade testing features.
                    </p>
                    
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <span className="px-2 py-0.5 bg-white dark:bg-zinc-800 text-xs font-bold text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-zinc-700">
                        Security
                      </span>
                      <span className="px-2 py-0.5 bg-white dark:bg-zinc-800 text-xs font-bold text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-zinc-700">
                        Smart Contracts
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image - Better responsive sizing */}
            <div className="flex justify-center lg:justify-end order-1 lg:order-2">
              <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-none">
                {/* Decorative elements - Responsive sizes */}
                <div className="absolute -top-3 sm:-top-4 -left-3 sm:-left-4 w-36 sm:w-48 md:w-56 lg:w-72 h-36 sm:h-48 md:h-56 lg:h-72 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-6 sm:-bottom-8 -right-3 sm:-right-4 w-36 sm:w-48 md:w-56 lg:w-72 h-36 sm:h-48 md:h-56 lg:h-72 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2"></div>
                
                <div className="relative z-10">
                  <Image
                    src="/images/hero/hero.png"
                    alt="TrustInn Security Analysis Platform"
                    width={600}
                    height={600}
                    priority
                    className="w-full h-auto rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 600px"
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