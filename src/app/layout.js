import { Geist, Geist_Mono } from "next/font/google";
import { Space_Grotesk } from "next/font/google";
import { Providers } from "@/components/providers";
import { Footer } from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata = {
  title: "NITMiner Technologies - Smart Contract Testing & Verification",
  description: "Advanced smart contract testing and verification solutions",
  icons: {
    icon: "https://nitminer.com/logo_img/logo-rbg.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased`} suppressHydrationWarning>
        <Providers>
          <div className="flex flex-col min-h-screen">
            {children}
            <Footer />
          </div>
          <Chatbot />
        </Providers>
      </body>
    </html>
  );
}
