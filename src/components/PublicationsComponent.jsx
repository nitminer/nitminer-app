"use client"
import { useState, useEffect, useRef } from "react"
import { FiExternalLink, FiNavigation } from "react-icons/fi"

export default function PublicationsComponent() {
  const [activeStation, setActiveStation] = useState(0);
  const scrollContainerRef = useRef(null);

  const publications = [
    { authors: "Sangharatna Godboley, P Radha Krishna, et al.", title: "Validation Framework for E-Contract and Smart Contract", conference: "EASE, ACM, Istanbul, June 2025", category: "Core A", year: 2025 },
    { authors: "Monika Rani Golla, Sangharatna Godboley", title: "SC-MCC Meta Program Efficiency using Dynamic Symbolic Execution", conference: "IEEE ICST 2025, Naples, Italy", category: "Core A", year: 2025 },
    { authors: "Monika Rani Golla, Sangharatna Godboley, et al.", title: "Reporting Unique-Cause MC/DC Score using Formal Verification", conference: "IEEE ICST 2025, Italy", category: "Core A", year: 2025 },
    { authors: "Monika Rani Golla, Sangharatna Godboley", title: "Automated SC-MCC Test Case Generation using Fuzzing", conference: "IEEE ICST 2025, Journal First", category: "Core A", year: 2025 },
    { authors: "Wei, C., Wu, T., Godboley, S., et al.", title: "ESBMC v7.7: Automating Branch Coverage Analysis", conference: "FASE, 2024", category: "Core B", year: 2024 },
    { authors: "Sangharatna Godboley, P. Radha Krishna", title: "VeriSol-MCE: Condition Coverage Analysis of Smart Contracts", conference: "IEEE ICST 2024, Toronto", category: "Core A", year: 2024 }
  ];

  useEffect(() => {
    const observerOptions = {
      root: scrollContainerRef.current,
      rootMargin: '-45% 0px -45% 0px', 
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index'));
          setActiveStation(index);
        }
      });
    }, observerOptions);

    const stations = document.querySelectorAll('.internal-station');
    stations.forEach((station) => observer.observe(station));

    return () => observer.disconnect();
  }, []);

  // Road height calculation logic
  const getRoadHeight = () => {
    // If we're at the first station, the line should exist but be at the very top node
    const totalGap = publications.length - 1;
    const progress = (activeStation / totalGap) * 100;
    return `${progress}%`;
  };

  return (
    <div className="w-full mt-15 bg-[#F5F1FF] dark:bg-[#0A0A0A] py-16 px-4 select-none" style={{ fontFamily: "'League Spartan', sans-serif" }}>
      
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-4xl md:text-7xl font-black text-[#3F3351] dark:text-white tracking-tighter uppercase leading-none">
          Our Research <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Publications.</span>
        </h1>
        <p className="text-xs font-black uppercase text-gray-400 tracking-[0.4em] mt-4">Scientific Roadmap & Milestones</p>
      </div>

      <div 
        ref={scrollContainerRef}
        className="max-w-6xl mx-auto h-[75vh] bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl rounded-[60px] border border-white/20 dark:border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-y-auto overflow-x-hidden relative custom-scrollbar p-6 lg:px-20"
      >
        {/* Container that determines the full scrollable height */}
        <div className="relative pt-32 pb-48">
          
          {/* THE TRACK (BACKGROUND LINE) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-32 bottom-48 w-2 bg-gray-200 dark:bg-zinc-800 rounded-full">
             {/* THE COVERED PATH (COLORED LINE) */}
             <div 
                className="w-full bg-gradient-to-b from-indigo-600 via-purple-600 to-pink-500 transition-all duration-1000 ease-out rounded-full origin-top"
                style={{ height: getRoadHeight() }}
             />
          </div>

          <div className="space-y-56 lg:space-y-72 relative z-10">
            {publications.map((pub, index) => {
              const isLeft = index % 2 === 0;
              const isCurrent = activeStation === index;

              return (
                <div 
                  key={index} 
                  data-index={index}
                  className="internal-station relative flex flex-col lg:flex-row items-center justify-center"
                >
                  {/* Content Wrappers */}
                  <div className={`w-full lg:w-[45%] transition-all duration-700 ${isLeft ? 'lg:pr-16 opacity-100 translate-x-0' : 'opacity-0 pointer-events-none hidden lg:block'}`}>
                    {isLeft && <PublicationCard pub={pub} isCurrent={isCurrent} />}
                  </div>

                  {/* CENTER NODE */}
                  <div className="relative flex items-center justify-center shrink-0 h-10 w-10">
                    <div className={`absolute w-6 h-6 rounded-full border-4 transition-all duration-500 z-20 ${isCurrent ? 'bg-white border-indigo-600 scale-125 shadow-[0_0_15px_rgba(79,70,229,0.6)]' : 'bg-gray-300 dark:bg-zinc-700 border-transparent'}`} />
                    
                    {/* BUS ICON */}
                    <div className={`absolute transition-all mt-18 duration-700 z-30 pointer-events-none ${isCurrent ? 'opacity-100 -translate-y-12 scale-110' : 'opacity-0 -translate-y-8 scale-50'}`}>
                       <FiNavigation size={32} className="rotate-140 text-indigo-600 drop-shadow-[0_0_10px_rgba(79,70,229,0.3)]" />
                    </div>
                  </div>

                  <div className={`w-full lg:w-[45%] transition-all duration-700 ${!isLeft ? 'lg:pl-16 opacity-100 translate-x-0' : 'opacity-0 pointer-events-none hidden lg:block'}`}>
                    {!isLeft && <PublicationCard pub={pub} isCurrent={isCurrent} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function PublicationCard({ pub, isCurrent }) {
  return (
    <div className={`transition-all duration-700 transform ${isCurrent ? 'scale-100 blur-none opacity-100 translate-y-0' : 'scale-90 blur-[3px] opacity-10 translate-y-4'}`}>
      <div className="p-8 bg-white dark:bg-zinc-950 rounded-[40px] shadow-2xl border border-white/40 dark:border-zinc-800 relative overflow-hidden group hover:border-indigo-500/50">
        <span className="absolute -top-6 -right-2 text-8xl font-black text-indigo-600/5 pointer-events-none">{pub.year}</span>
        <div className="relative z-10">
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-4 inline-block ${isCurrent ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
            {pub.category}
          </span>
          <h3 className="text-xl lg:text-2xl font-black text-[#3F3351] dark:text-white uppercase leading-[0.9] mb-4">{pub.title}</h3>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-6 italic line-clamp-2">{pub.authors}</p>
          <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-zinc-800/50">
             <p className="text-[10px] font-black text-indigo-400 uppercase">{pub.conference}</p>
             <FiExternalLink size={18} className="text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}