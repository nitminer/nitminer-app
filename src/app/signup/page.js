import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import SignupComponent from "@/components/SignupComponent";

export const metadata = {
  title: "Sign Up | NitMiner Technologies",
  description: "Create your NitMiner Technologies account",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <Header />
      <SignupComponent />
  
    </div>
  );
}
