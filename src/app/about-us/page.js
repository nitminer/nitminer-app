import Header from "@/components/Header";
import AboutUsComponent from "@/components/AboutUsComponent";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "About Us - NITMINER",
  description: "Learn more about NITMINER - our mission, vision, values, and how we're revolutionizing the mining industry through innovation and technology.",
};

export default function AboutUsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-start bg-white">
        <AboutUsComponent />
      </main>
      {/* <Footer /> */}
    </div>
  )
}
