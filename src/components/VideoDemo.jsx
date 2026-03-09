'use client';

import { useRef, useEffect, useState } from 'react';

export default function VideoDemo() {
  const videoRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting && videoRef.current) {
          videoRef.current.play().catch(() => {
            // Autoplay not allowed, that's okay
          });
        }
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  return (
    <section className="w-full py-8 sm:py-12 md:py-16 lg:py-20 bg-white dark:bg-black relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 sm:top-40 -right-32 sm:-right-48 w-48 sm:w-96 h-48 sm:h-96 bg-blue-200/10 dark:bg-blue-900/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -left-32 sm:-left-48 w-48 sm:w-96 h-48 sm:h-96 bg-purple-200/10 dark:bg-purple-900/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 mx-auto max-w-10xl">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-block">
            <span className="px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/30 rounded-full border border-blue-200/50 dark:border-blue-800/50 mb-3 sm:mb-4 inline-block">
              HOW IT WORKS
            </span>
          </div>
          <h2 
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mt-3 sm:mt-4 leading-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Tool Demo &{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 mt-3 sm:mt-4 max-w-2xl mx-auto">
            Watch our comprehensive demo to understand how our tools can transform your workflow and boost productivity
          </p>
        </div>

        {/* Video Container */}
        <div className="relative w-full max-w-7xl mx-auto group">
          {/* Outer Border with Gradient */}
          <div className="p-0.5 sm:p-1 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl">
            {/* Inner Container */}
            <div className="relative bg-black rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden">
              {/* Aspect Ratio Container */}
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                {/* Video Element */}
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster="/images/hero/demo-poster.jpg"
                  controls
                >
                  <source src="/video/demovideo.mp4" type="video/mp4" />
                  <source src="/video/demovideo.mov" type="video/quicktime" />
                  Your browser does not support the video tag.
                </video>

                {/* Play Button Overlay - Only shows if not playing */}
                {!isInView && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300 hover:bg-black/40">
                    <div className="flex flex-col items-center gap-3 sm:gap-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 group-hover:scale-110 transition-transform duration-300">
                        <svg
                          className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                      <p className="text-white font-semibold text-sm sm:text-base">Click to play demo</p>
                    </div>
                  </div>
                )}

                {/* Gradient Overlay on Top */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>

          {/* Info Text Below Video */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
              Discover how our advanced tools can streamline your workflow with intelligent automation, real-time analytics, and seamless integration
            </p>
          </div>
        </div>

        {/* Features Under Video */}
        <div className="mt-12 sm:mt-16 md:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
            <div className="flex items-center gap-3 sm:gap-4 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Lightning Fast</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Lightning-fast performance with optimized algorithms</p>
          </div>

          <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-800 hover:border-purple-400 dark:hover:border-purple-600 transition-colors">
            <div className="flex items-center gap-3 sm:gap-4 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Easy to Use</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Intuitive interface that anyone can master instantly</p>
          </div>

          <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-800 hover:border-pink-400 dark:hover:border-pink-600 transition-colors">
            <div className="flex items-center gap-3 sm:gap-4 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Fully Customizable</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Adapt the tool to your unique business needs</p>
          </div>
        </div>
      </div>
    </section>
  );
}
