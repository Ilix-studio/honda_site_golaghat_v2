import { ContactSection } from "./mainComponents/Home/ContactSection";
import { EmiCalculator } from "./mainComponents/Home/EmiCalculator";
import { FeaturesSection } from "./mainComponents/Home/FeatureSection";

import { Footer } from "./mainComponents/Home/Footer";

import NewUI from "./mainComponents/Home/NewUI";
import { RevealOnScroll } from "./mainComponents/Home/RevealOnScroll";
// import UnderDevelopment from "./mainComponents/UnderDevelopment";
import AvailableModel from "./mainComponents/Home/AvailableModel";
import ServiceDetails from "./mainComponents/Home/ServiceDetails";

import GoogleReviews from "./mainComponents/Reviews/GoogleReviews";
// import UnderDevelopment from "./mainComponents/UnderDevelopment";

function Home() {
  return (
    <div className='min-h-screen flex flex-col'>
      <NewUI />
      <main>
        {/* <UnderDevelopment /> */}
        <RevealOnScroll minHeight={600}>
          <AvailableModel />
        </RevealOnScroll>
        <RevealOnScroll>
          <ServiceDetails />
        </RevealOnScroll>

        <br />
        <br />
        <RevealOnScroll>
          <EmiCalculator />
        </RevealOnScroll>
        <br />
        <br />
        <RevealOnScroll>
          <FeaturesSection />
        </RevealOnScroll>
        <br />
        <br />
        <RevealOnScroll>
          <ContactSection />
        </RevealOnScroll>
        <br />

        <RevealOnScroll>
          <GoogleReviews />
        </RevealOnScroll>
        <br />
        <RevealOnScroll minHeight={400}>
          <Footer />
        </RevealOnScroll>
      </main>
    </div>
  );
}

export default Home;
