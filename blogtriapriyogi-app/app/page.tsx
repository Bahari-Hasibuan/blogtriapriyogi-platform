import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import PromoCards from "../components/landing/PromoCards";
import Features from "../components/landing/Features";
import AIStudio from "../components/landing/AIStudio";
import Pricing from "../components/landing/Pricing";
import FAQ from "../components/landing/FAQ";
import Footer from "../components/landing/Footer";

export default function Home() {
  return (
    <main className="site">
      <Navbar />
      <Hero />
      <PromoCards />
      <Features />
      <AIStudio />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
