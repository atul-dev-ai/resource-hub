import type { Metadata } from "next";
import Hero from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import StatsSection from "@/components/StatsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ResourcesSection from "@/components/ResourcesSection";
import DepartmentsSection from "@/components/DepartmentsSection";
import TrendingResources from "@/components/TrendingResources";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Varsity Resource Hub | Study Materials",
  description: "Share and access past exams, quiz questions, and study notes with your university mates.",
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between overflow-x-hidden w-full">
      {/* Navbar */}
      <Navbar /> 

      {/* Hero Section */}
      <Hero />

      {/* Stats Section */}
      <StatsSection />


      {/* Resources Filtering Section */}
      <ResourcesSection />

      {/* Departments & Structured Browsing */}
      <DepartmentsSection />

      {/* Trending & Latest Uploads */}
      <TrendingResources />

      {/* How It Works Section */}
      <HowItWorksSection />
      
      {/* Footer */}
      <Footer />
    </main>
  );
}