import { Geist, Geist_Mono } from "next/font/google";
import { Space_Grotesk } from "next/font/google";
import { Providers } from "@/components/providers";
import ClientLayout from "@/components/ClientLayout";
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
  title: "NITMiner Technologies - Blockchain Development, Smart Contract Audit & AI Solutions",
  description: "Expert blockchain development, smart contract testing, AI/ML solutions, mobile app development, and full-stack services. NITW incubated startup providing enterprise-grade Web3 solutions.",
  keywords: ["blockchain development", "smart contract audit", "solidity development", "ethereum", "DeFi", "NFT", "Web3", "AI/ML", "mobile development", "full stack", "cloud solutions", "trustinn"],
  authors: [{ name: "NITMiner Technologies" }],
  creator: "NITMiner Technologies",
  publisher: "NITMiner Technologies",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  icons: {
    icon: "/images/Logo/logo.png",
    apple: "/images/Logo/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nitminer.com",
    title: "NITMiner Technologies - Blockchain & AI Innovation",
    description: "Expert blockchain development, smart contract audit, AI solutions, and Web3 services. NITW incubated startup.",
    siteName: "NITMiner Technologies",
    images: [
      {
        url: "https://nitminer.com/images/Logo/logo.png",
        width: 1200,
        height: 630,
        alt: "NITMiner Technologies - Blockchain Innovation",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@nitminer",
    creator: "@nitminer",
    title: "NITMiner Technologies - Blockchain & AI Innovation",
    description: "Expert blockchain development, smart contract audit, AI solutions, and Web3 services",
    images: ["https://nitminer.com/images/Logo/logo.png"],
  },
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  canonical: "https://nitminer.com",
  alternates: {
    canonical: "https://nitminer.com",
  },
};

export default function RootLayout({ children }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NITMiner Technologies",
    "description": "Expert blockchain development, smart contract audit, AI/ML solutions, and Web3 services",
    "url": "https://nitminer.com",
    "logo": "https://nitminer.com/images/Logo/logo.png",
    "foundingDate": "2022",
    "foundingLocation": "Warangal, India",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-7013306805",
      "contactType": "Customer Service",
      "areaServed": "IN",
      "availableLanguageID": "en"
    },
    "sameAs": [
      "https://www.linkedin.com/company/nitminer-technologies-private-limited/",
      "https://twitter.com/nitminer",
      "https://github.com/nitminer",
      "https://www.facebook.com/people/NITMiner-Technologies-Private-Limited/",
      "https://www.instagram.com/nitminer_technologies_pvt_ltd"
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "NIT Warangal Campus",
      "addressLocality": "Warangal",
      "addressRegion": "Telangana",
      "postalCode": "506004",
      "addressCountry": "IN"
    },
    "areaServed": {
      "@type": "Country",
      "name": "IN"
    },
    "knowsAbout": [
      "Blockchain Development",
      "Smart Contract Audit",
      "Web3 Solutions",
      "DeFi Development",
      "NFT Platform",
      "AI/Machine Learning",
      "Full Stack Development",
      "Mobile App Development",
      "Cloud Solutions"
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.documentElement.classList.remove('dark');
                document.documentElement.style.backgroundColor = '#ffffff';
                document.body.style.backgroundColor = '#ffffff';
                localStorage.removeItem('theme');
                localStorage.setItem('theme', 'light');
              } catch (e) {}
            `
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="google-site-verification" content="" />
        <meta name="msvalidate.01" content="" />
        <link rel="canonical" href="https://nitminer.com" />
        <link rel="alternate" hrefLang="en-IN" href="https://nitminer.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased bg-white text-gray-900`}
        style={{ backgroundColor: '#ffffff' }}
        suppressHydrationWarning
      >
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}