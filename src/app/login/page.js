import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import LoginComponent from "@/components/LoginComponent";

export const metadata = {
  title: "Login | NitMiner Technologies",
  description: "Login to your NitMiner Technologies account",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <Header />
      <LoginComponent />
    </div>
  );
}
