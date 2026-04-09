import { ContactSection } from "./mainComponents/Home/ContactSection";
import { EmiCalculator } from "./mainComponents/Home/EmiCalculator";
import { FeaturesSection } from "./mainComponents/Home/FeatureSection";

import { Footer } from "./mainComponents/Home/Footer";

import NewUI from "./mainComponents/Home/NewUI";
// import UnderDevelopment from "./mainComponents/UnderDevelopment";
import AvailableModel from "./mainComponents/Home/AvailableModel";
import ServiceDetails from "./mainComponents/Home/ServiceDetails";

import DealershipReviews from "./mainComponents/Home/DealershipReviews";

function Home() {
  return (
    <div className='min-h-screen flex flex-col'>
      <NewUI />
      <main>
        <AvailableModel />
        <ServiceDetails />

        <br />
        <br />
        <EmiCalculator />
        <br />
        <br />
        <FeaturesSection />
        <br />
        <br />
        <ContactSection />
        <br />
        <DealershipReviews />
        <br />
        <Footer />
      </main>
    </div>
  );
}

export default Home;
