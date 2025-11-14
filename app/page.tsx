import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import PainPoints from "@/components/PainPoints";
import Waitlist from "@/components/Waitlist";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <PainPoints />
      <HowItWorks />
      <Waitlist />
      <Footer />
    </main>
  );
}
