import Header from "@/components/Header";
import { AwardsComponent } from "@/components/AwardsComponent";
import { Footer } from "@/components/Footer";

export default function AwardsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black font-sans">
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-start bg-white dark:bg-black">
        <AwardsComponent />
      </main>
      
    </div>
  )
}
