'use client';

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dynamic from "next/dynamic";
import AdvertiseBanner from "./AdvertiseBanner";
import { useActivityTracking } from "@/hooks/useActivityTracking";

const UnifiedChatbot = dynamic(() => import("@/components/UnifiedChatbot"), { ssr: false });

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");
  
  // Initialize activity tracking
  useActivityTracking();

  useEffect(() => {
    // Ensure light theme is always applied
    document.documentElement.classList.remove('dark');
    document.documentElement.style.backgroundColor = '#ffffff';
    document.body.style.backgroundColor = '#ffffff';
    document.documentElement.style.color = '#000000';
    document.body.style.color = '#000000';
  }, []);

  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-white">
        {children}
        <ToastContainer theme="light" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      
     
      <Header />
      
      <main className="flex-grow pt-20">
        {children}
      </main>
      <UnifiedChatbot />
      <Footer />
      <ToastContainer theme="light" />
    </div>
  );
}