
import Certificate from "@/components/landing/Certificate";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import Navbar  from "@/components/landing/Navbar";
import Stat from "@/components/landing/Stat";
import Services from "@/components/landing/Services";
import Mission from "@/components/landing/Mission";
import Contact from "@/components/landing/Contact";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Stat/>
      <Services/>
      <Mission />
      <Certificate />
      <Contact />
      <Footer />    
    </div>
  );
}
