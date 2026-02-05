import Header from "@/components/Header";
import { TeamComponent } from "@/components/TeamComponent";
import { Footer } from "@/components/Footer";

export default function TeamPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black font-sans">
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-start bg-white dark:bg-black">
        <TeamComponent />
      </main>
      
    </div>
  )
}
