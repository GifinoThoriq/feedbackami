"use server";

import { getProfile } from "./actions/profileActions";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/landing/PricingSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default async function Home() {
  const profile = await getProfile();

  return (
    <div className="min-h-screen">
      <Navbar userFirstName={profile?.first_name ?? null} />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        {/* <PricingSection /> */}
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
