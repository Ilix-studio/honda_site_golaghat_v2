import { Button } from "@/components/ui/button";
import { useGetBikesQuery } from "../../redux-store/services/bikeApi";
import { BikeCard } from "../BikeDetails/DetailsUIParts/BikeCard";
import { motion } from "framer-motion";
import { ArrowBigRight } from "lucide-react";

// Skeleton Components for loading state
const Skeleton = ({ className = "", ...props }) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] rounded ${className}`}
      {...props}
    />
  );
};

const CardSkeleton = ({ showImage = true, lines = 3 }) => {
  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm'>
      {showImage && <Skeleton className='w-full h-48 mb-4 rounded-md' />}
      <div className='space-y-3'>
        <Skeleton className='h-6 w-3/4' />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={`h-4 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
          />
        ))}
      </div>
    </div>
  );
};

const AvailableModel = () => {
  // Fetch bikes using Redux query with featured/popular filters
  const {
    data: bikesResponse,
    isLoading,
    error,
    refetch,
  } = useGetBikesQuery({
    limit: 8, // Show only 8 bikes in the featured section
    inStock: true, // Only show bikes that are in stock
    sortBy: "popular", // Sort by popularity or recent
  });

  const featuredBikes = bikesResponse?.data || [];

  if (error) {
    return (
      <section
        id='models'
        className='py-20 bg-gradient-to-br from-gray-50/80 via-white to-red-50/30 dark:from-gray-900/50 dark:via-gray-800/30 dark:to-red-900/10'
      >
        <div className='container mx-auto px-4'>
          <motion.div
            className='text-center mb-8'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className='text-2xl md:text-3xl font-bold tracking-tight'>
              Our Available Models
            </h2>
            <p className='mt-2 text-muted-foreground max-w-2xl mx-auto'>
              Discover our premium collection of Honda motorcycles and scooters,
              engineered for performance and designed for the future.
            </p>
          </motion.div>

          <div className='text-center py-12'>
            <p className='text-lg text-muted-foreground mb-4'>
              Unable to load models. Please try again.
            </p>
            <Button
              onClick={() => refetch()}
              className='bg-red-500 hover:bg-red-600 text-white'
            >
              Retry Loading
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id='models' className='py-20 bg-muted/30'>
      <div className='container mx-auto px-4'>
        <motion.div
          className='text-center mb-8'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className='text-2xl md:text-3xl font-bold tracking-tight'>
            Our Available Models
          </h2>
          <p className='mt-2 text-muted-foreground max-w-2xl mx-auto'>
            Discover our premium collection of Honda motorcycles and scooters,
            engineered for performance and designed for the future.
          </p>
        </motion.div>

        {isLoading ? (
          // Loading skeleton grid
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {Array.from({ length: 8 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : featuredBikes.length === 0 ? (
          // No bikes available
          <div className='text-center py-12'>
            <p className='text-lg text-muted-foreground mb-4'>
              No models available at the moment.
            </p>
            <Button
              onClick={() => refetch()}
              variant='ghost'
              className=' text-red-500 hover:bg-red-50 underline'
            >
              Refresh Models
              <ArrowBigRight />
            </Button>
          </div>
        ) : (
          // Display bikes using BikeCard component
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {featuredBikes.map((bike) => (
              <BikeCard key={bike.id || bike._id} bike={bike} />
            ))}
          </div>
        )}

        <div className='text-center mt-12'>
          <Button
            size='lg'
            variant='outline'
            className='border-red-500 text-red-500 hover:bg-primary hover:text-primary-foreground px-8 bg-transparent'
            onClick={() => (window.location.href = "/bikes")} // Navigate to view all bikes page
          >
            View All Models
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AvailableModel;
