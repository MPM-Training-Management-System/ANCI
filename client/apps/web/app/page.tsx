import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import WhyJoin from "@/components/landing/WhyJoin";
import Programs from "@/components/landing/Programs";
import Services from "@/components/landing/Services";
import Mission from "@/components/landing/Mission";
import Faculty from "@/components/landing/Faculty";
import Governance from "@/components/landing/Governance";
import Testimonials from "@/components/landing/Testimonials";
import Certificate from "@/components/landing/Certificate";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f9ff] text-[#0b1c30]">
      <Navbar />

      <Hero />

      <WhyJoin />

      <Programs />

      <Services />

      <Mission />

      <Faculty />

      <Governance />

      <Testimonials />

      <Certificate />

      <Contact />

      <Footer />
    </main>
  );
}