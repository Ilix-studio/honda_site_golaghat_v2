import { Footer } from "../Home/Footer";

import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { GetApprovedForm } from "./GetApprovedForm";
import { Header } from "../Home/Header/Header";
import { useGetBikeByIdQuery } from "@/redux-store/services/BikeSystemApi/bikeApi";

// Usage in your Finance component or as a separate page
export const FinanceWithBikeEnquiry: React.FC = () => {
  // Bike detail pages link here as /finance?bikeId=<id>&type=bike|scooter.
  // Without this the bike context in the URL was dropped: the form fell back to
  // an empty bikeId, so every application was stored as "general-financing"
  // with no bikeEnquiry, and the staff table showed "—" for Bike Interest and
  // Category.
  const [searchParams] = useSearchParams();
  const bikeId = searchParams.get("bikeId") ?? "";

  const { data: bikeData } = useGetBikeByIdQuery(bikeId, { skip: !bikeId });
  const selectedBike = bikeData?.data;

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
            {selectedBike
              ? `Finance your ${selectedBike.modelName}`
              : "Find Your Perfect Bike with Easy Financing"}
          </h1>
          <p className='text-xl text-muted-foreground max-w-3xl mx-auto'>
            Tell us about your dream bike and financial situation. We'll provide
            personalized recommendations and financing options tailored just for
            you.
          </p>
        </motion.div>

        {/* The form seeds bikeId / bikeModel / category from selectedBike, so it
            must not mount until the query has resolved — its initial state is
            computed once via useState's lazy initialiser. */}
        {bikeId && !selectedBike ? (
          <div className='text-center py-16 text-muted-foreground'>
            Loading bike details…
          </div>
        ) : (
          <GetApprovedForm
            key={selectedBike?._id ?? "no-bike"}
            selectedBike={selectedBike}
            onSubmit={(result) => {
              console.log("Application submitted:", result);
              // Handle success (e.g., redirect, show confirmation)
            }}
          />
        )}
      </div>

      <Footer />
    </main>
  );
};
