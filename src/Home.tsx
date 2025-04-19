import { ContactSection } from "./mainComponents/ContactSection";
import { EmiCalculator } from "./mainComponents/EmiCalculator";
import { FeaturesSection } from "./mainComponents/FeatureSection";

import { Footer } from "./mainComponents/Footer";
import { Header } from "./mainComponents/Header";
import HondaCarousel from "./mainComponents/HondaCarousel";

function Home() {
  return (
    <main className='min-h-screen flex flex-col'>
      <Header />
      <HondaCarousel />
      <EmiCalculator />
      <FeaturesSection />
      <ContactSection />
      <Footer />
    </main>
  );
}

export default Home;
