import Header from "@/components/Header";
import { ComingSoonComponent } from "@/components/ComingSoonComponent";

export const metadata = {
  title: "Services - Blockchain Development, Smart Contract Audit & AI Solutions | NITMiner",
  description: "Explore NITMiner's comprehensive services: blockchain development, smart contract auditing, AI/ML solutions, mobile app development, full-stack services, and Web3 consulting for enterprises.",
  keywords: ["blockchain services", "smart contract audit", "solidity development", "Web3 consulting", "DeFi development", "NFT services", "AI/ML services", "full stack development", "mobile development", "cloud solutions"],
  openGraph: {
    title: "Our Services - NITMiner Technologies",
    description: "Expert blockchain, AI/ML, and full-stack development services",
    url: "https://nitminer.com/services",
    type: "website",
    images: [
      {
        url: "https://nitminer.com/images/Logo/logo.png",
        width: 1200,
        height: 630,
        alt: "NITMiner Services",
      },
    ],
  },
  alternates: {
    canonical: "https://nitminer.com/services",
  },
};

export default function ServicesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black font-sans">
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-start bg-white dark:bg-black">
        <ComingSoonComponent />
      </main>
    </div>
  )
}
