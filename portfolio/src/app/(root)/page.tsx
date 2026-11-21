import ChatbotLauncher from "@/components/ChatbotLauncher";
import Experience from "@/components/Experience";
import HomeAboutSection from "@/components/HomeAboutSection";
import HomeContactSection from "@/components/HomeContactSection";
import HomeProfileSections from "@/components/HomeProfileSections";
import MediumWritingSection from "@/components/MediumWritingSection";
import Navbar from "@/components/Navbar/Navbar";
import PortfolioFooter from "@/components/PortfolioFooter";
import Projects from "@/components/Projects";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50">
      <Navbar />
      <div>
        <HomeProfileSections />
        <HomeAboutSection />
        <Experience />
        <Projects />
        <MediumWritingSection />
        <HomeContactSection />
      </div>
      <PortfolioFooter />
      <ChatbotLauncher />
    </div>
  );
}
