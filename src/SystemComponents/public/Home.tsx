import GoogleReviews from "./Reviews/GoogleReviews";
import AvailableModel from "./Home/AvailableModel";
import { ContactSection } from "./Home/ContactSection";
import { EmiCalculator } from "./Home/EmiCalculator";
import { FeaturesSection } from "./Home/FeatureSection";
import { Footer } from "./Home/Footer";
import NewUI from "./Home/NewUI";
import ServiceDetails from "./Home/ServiceDetails";

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

        <GoogleReviews />
        <br />
        <Footer />
      </main>
    </div>
  );
}

export default Home;
