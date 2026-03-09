"use client"
import { useState, useEffect } from "react"
import { FiAward } from "react-icons/fi"

export function AwardsComponent() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const awards = [
    {
      title: "RECOGNITION award in the Research Excellence",
      category: "(Teaching Faculty-National)",
      recipient: "Sangharatna Godboley",
      organization: "Institution of Engineers (India) [IEI]",
      awardName: "IEI NMLC FCRIT Excellence Awards 2023",
      year: 2023
    },
    {
      title: "Runner Up award in the Academic Excellence",
      category: "(Teaching Faculty-National)",
      recipient: "Sangharatna Godboley",
      organization: "Institution of Engineers (India) [IEI]",
      awardName: "IEI NMLC FCRIT Excellence Awards 2024",
      year: 2024
    }
  ]

  return (
    <div className="bg-[#0A0A0A] w-full select-none" style={{ fontFamily: "'League Spartan', sans-serif" }}>
      
      {/* --- LAYER: AWARDS --- */}
      <section className="relative min-h-screen lg:h-screen sticky top-0 overflow-hidden z-30 bg-[#F5F1FF] dark:bg-[#0A0A0A] shadow-[0_-50px_100px_rgba(0,0,0,0.4)] flex items-center justify-center py-20 lg:py-0">
        <div 
          className="w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out"
          style={{ 
            // Scaling logic for desktop; softened for mobile to prevent layout breaks
            transform: typeof window !== 'undefined' && window.innerWidth > 1024 
              ? `scale(${scrollY > 4200 ? 0.85 : 1})` 
              : 'none',
            opacity: scrollY > 4800 ? 0 : 1 
          }}
        >
          <div className="max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="text-center mb-10 lg:mb-16">
              <span className="inline-block px-3 py-1 lg:px-4 lg:py-1.5 mb-4 lg:mb-6 text-[10px] lg:text-xs font-black tracking-[0.2em] lg:tracking-[0.3em] text-indigo-600 bg-indigo-100 dark:bg-indigo-900/40 rounded-full uppercase">
                Excellence Recognized
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-[#3F3351] dark:text-white tracking-tighter uppercase mb-4 leading-[0.9]">
                Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Achievements.</span>
              </h1>
            </div>

            {/* Awards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 mb-10 lg:mb-16">
              {awards.map((award, index) => (
                <div 
                  key={index}
                  className="group relative p-6 lg:p-8 bg-white dark:bg-zinc-900/50 backdrop-blur-xl border-l-4 lg:border-l-8 border-indigo-600 rounded-[20px] lg:rounded-[30px] shadow-xl lg:shadow-2xl transition-all duration-500"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4 lg:gap-6">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-indigo-600 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30 group-hover:rotate-12 transition-transform">
                      <FiAward size={24} className="text-white lg:hidden" />
                      <FiAward size={32} className="text-white hidden lg:block" />
                    </div>
                    <div>
                      <h3 className="text-lg lg:text-2xl font-black text-[#3F3351] dark:text-white leading-tight uppercase mb-2 lg:mb-4">
                        {award.title} <span className="text-indigo-600/60 block sm:inline">{award.category}</span>
                      </h3>
                      <div className="space-y-1">
                         <p className="text-indigo-600 dark:text-indigo-400 font-black text-xs lg:text-sm uppercase tracking-widest">{award.recipient}</p>
                         <p className="text-gray-500 dark:text-gray-400 font-bold italic text-xs lg:text-base">{award.awardName}</p>
                         <p className="text-[10px] lg:text-xs text-gray-400 font-black uppercase tracking-tighter">{award.organization} • {award.year}</p>
                      </div>
                    </div>
                  </div>
                  {/* Decorative Glow - Hidden on small screens for performance */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl hidden lg:block group-hover:bg-indigo-500/10 transition-colors"></div>
                </div>
              ))}
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {[
                { label: "Awards", val: "2+" },
                { label: "Level", val: "National" },
                { label: "Authority", val: "IEI India" },
                { label: "Standard", val: "Excellence" }
              ].map((stat, i) => (
                <div key={i} className="p-4 lg:p-6 bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl lg:rounded-2xl text-center backdrop-blur-sm">
                  <p className="text-lg lg:text-2xl font-black text-[#3F3351] dark:text-white leading-none mb-1">{stat.val}</p>
                  <p className="text-[8px] lg:text-[10px] font-black text-indigo-600 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}