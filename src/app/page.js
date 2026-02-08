import Image from "next/image";
import Header from "@/components/Header";
import HeroComponent from "@/components/HeroComponent";
import { AboutUs } from "@/components/AboutUs";
import { ImageCarousel } from "@/components/ImageCarousel";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <Header />
      
      <main className="flex flex-1 w-full flex-col items-center justify-start bg-white dark:bg-black">

        {/* <section className="w-full">
          <ImageCarousel />
        </section> */}
        {/* Hero Section */}
        <section className="w-full">
          <HeroComponent />
        </section>

        {/* Carousel Section - Commented Out */}
        <h1>updating now at morning now</h1>
        {/* About Us Section */}
        <section className="w-full">
          <AboutUs />
        </section>

       
      </main>
    </div>
  );
}
