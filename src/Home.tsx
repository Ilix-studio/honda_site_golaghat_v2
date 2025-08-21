import { ContactSection } from "./mainComponents/Home/ContactSection";
import { EmiCalculator } from "./mainComponents/Home/EmiCalculator";
import { FeaturesSection } from "./mainComponents/Home/FeatureSection";

import { Footer } from "./mainComponents/Home/Footer";
import { Header } from "./mainComponents/Home/Header";

import HondaCarousel from "./mainComponents/Home/HondaCarousel";
import HondaCarousel2 from "./mainComponents/Home/HondaCarousel2";

function Home() {
  return (
    <main className='min-h-screen flex flex-col'>
      <Header />
      <HondaCarousel />
      <HondaCarousel2 />
      <EmiCalculator />
      <FeaturesSection />
      <ContactSection />
      <Footer />
    </main>
  );
}

export default Home;
