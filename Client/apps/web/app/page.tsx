
import Certificate from "@/components/landing/Certificate";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import Navbar  from "@/components/landing/Navbar";
import Stat from "@/components/landing/Stat";



export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Stat/>
      <Features />
      <Certificate />
      <Footer />

      
    </div>
  );
}
