import Image from "next/image";
import HeroComponent from "@/components/HeroComponent";
import VideoDemo from "@/components/VideoDemo";
import  AboutUs  from "@/components/AboutUs";
import { ImageCarousel } from "@/components/ImageCarousel";
import AdvertiseBanner from "@/components/AdvertiseBanner";

export default function Home() {
  return (
    <div className="bg-white font-sans">
      
      <main className="w-full bg-white">

        {/* Hero Section */}
        <section className="w-full">
          <HeroComponent />

        </section>
        {/* Video Demo Section */}
        {/* <section className="w-full">
          <VideoDemo />
        </section> */}

        {/* About Us Section */}
        {/* <section className="relative w-full">
          <AboutUs />
        </section> */}

       
      </main>
    </div>
  );
}
