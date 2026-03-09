'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FiAward, 
  FiClock, 
  FiCheckCircle, 
  FiTrendingUp, 
  FiZap 
} from 'react-icons/fi';

export default function AdvertiseBanner() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleBannerClick = () => {
    router.push('/paid-internships');
  };

  return (
    <div onClick={handleBannerClick} className="left-0  justify-center items-center p-3 right-0 w-full bg-[#1A1A1A] border-b border-white/10 overflow-hidden z-50 cursor-pointer hover:bg-[#252525] transition-colors duration-300">
      {/* Subtle Gradient Overlay */}
      <div className=" bg-gradient-to-r from-indigo-600/20 via-transparent to-purple-600/20"></div>

      {/* Scrolling content container */}
      <div className="relative  overflow-hidden ">
        <div className="flex animate-[scroll_35s_linear_infinite] whitespace-nowrap items-center">
          {/* Repeat content for seamless loop */}
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex items-center px-12 space-x-12">
              
              {/* Certification Label with Icon */}
              <div className="flex items-center gap-2 text-white">
                <FiAward className="text-yellow-400 w-5 h-5" />
                <span className="font-black text-sm uppercase tracking-widest">
                  Premium Certification
                </span>
              </div>

              {/* Price Tag - Professional Rounded Style */}
              <div className="flex items-center gap-3 bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
                <span className="text-white/50 line-through text-xs font-medium">₹15,000</span>
                <span className="text-white font-bold text-lg">₹4,999</span>
                <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase">
                  <FiZap className="w-3 h-3" /> Save 67%
                </div>
              </div>

              {/* Feature 1: Recognition */}
              <div className="flex items-center gap-2 text-white/80 text-sm font-semibold">
                <FiCheckCircle className="text-indigo-400 w-4 h-4" />
                <span>Industry Recognized</span>
              </div>

              {/* Feature 2: Growth */}
              <div className="flex items-center gap-2 text-white/80 text-sm font-semibold">
                <FiTrendingUp className="text-purple-400 w-4 h-4" />
                <span>Career Growth Guarantee</span>
              </div>

              {/* Urgency with Icon */}
              <div className="flex items-center gap-2 bg-red-600/20 text-red-400 px-4 py-1.5 rounded-lg border border-red-600/30 animate-pulse">
                <FiClock className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-tighter">Limited Slots Remaining</span>
              </div>

              {/* Professional Divider */}
              <div className="h-4 w-[1px] bg-white/20"></div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}