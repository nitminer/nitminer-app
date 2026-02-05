import Header from "@/components/Header";
import { PublicationsComponent } from "@/components/PublicationsComponent";
import { Footer } from "@/components/Footer";

export default function PublicationsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black font-sans">
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-start bg-white dark:bg-black">
        <PublicationsComponent />
      </main>
    
    </div>
  )
}
