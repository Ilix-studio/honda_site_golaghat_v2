import { Footer } from "../Home/Footer";

import { motion } from "framer-motion";
import { GetApprovedForm } from "./GetApprovedForm";
import { Header } from "../Home/Header/Header";

// Usage in your Finance component or as a separate page
export const FinanceWithBikeEnquiry: React.FC = () => {
  return (
    <main className='min-h-screen flex flex-col'>
      <Header />

      <div className='container pt-28 pb-10 px-4 flex-grow'>
        {/* Hero Section */}
        <motion.div
          className='text-center mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className='text-4xl font-bold mb-4'>
            Find Your Perfect Bike with Easy Financing
          </h1>
          <p className='text-xl text-muted-foreground max-w-3xl mx-auto'>
            Tell us about your dream bike and financial situation. We'll provide
            personalized recommendations and financing options tailored just for
            you.
          </p>
        </motion.div>

        <GetApprovedForm
          onSubmit={(result) => {
            console.log("Application submitted:", result);
            // Handle success (e.g., redirect, show confirmation)
          }}
        />
      </div>

      <Footer />
    </main>
  );
};
