import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetBikesQuery } from "@/redux-store/services/BikeSystemApi/bikeApi";

import { motion } from "framer-motion";
import { ArrowRight, Filter, Grid, List, Bike, Car } from "lucide-react";
import { Link } from "react-router-dom";
import FallBackHonda from "@/fallback/FallBackHonda";
import { BikeCard } from "@/SystemComponents/shared/BikeDetails/DetailsUIParts/BikeCard";

// Skeleton Components
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
  const [activeTab, setActiveTab] = useState<"all" | "bike" | "scooter">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch bikes and scooters with different filters
  const {
    data: allVehiclesResponse,
    isLoading: isLoadingAll,
    error: errorAll,
  } = useGetBikesQuery({
    limit: 12,
    inStock: true,
  });

  const {
    data: bikesResponse,
    isLoading: isLoadingBikes,
    error: errorBikes,
  } = useGetBikesQuery({
    mainCategory: "bike",
    limit: 8,
    inStock: true,
  });

  const {
    data: scootersResponse,
    isLoading: isLoadingScooters,
    error: errorScooters,
  } = useGetBikesQuery({
    mainCategory: "scooter",
    limit: 8,
    inStock: true,
  });

  // Get data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "bike":
        return {
          vehicles: bikesResponse?.data?.bikes || [],
          isLoading: isLoadingBikes,
          error: errorBikes,
        };
      case "scooter":
        return {
          vehicles: scootersResponse?.data?.bikes || [],
          isLoading: isLoadingScooters,
          error: errorScooters,
        };
      default:
        return {
          vehicles: allVehiclesResponse?.data?.bikes || [],
          isLoading: isLoadingAll,
          error: errorAll,
        };
    }
  };

  const { vehicles, isLoading, error } = getCurrentData();

  // Get stats for each category
  const getStats = () => {
    const allVehicles = allVehiclesResponse?.data?.bikes || [];
    const bikes = allVehicles.filter((v) => v.mainCategory === "bike");
    const scooters = allVehicles.filter((v) => v.mainCategory === "scooter");

    return {
      total: allVehicles.length,
      bikes: bikes.length,
      scooters: scooters.length,
      newModels: allVehicles.filter((v) => v.isNewModel).length,
    };
  };

  const stats = getStats();

  // Error state
  if (error) {
    return <FallBackHonda />;
  }

  return (
    <section id='models' className='py-20 bg-muted/30'>
      <div className='container mx-auto px-4'>
        {/* Header Section */}
        {/* <motion.div
          className='text-center mb-12'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className='text-3xl md:text-4xl font-bold tracking-tight mb-4'>
           
          </h2>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto mb-6'>
            Discover our premium Honda motorcycles and scooters, engineered for
            performance and designed for the future.
          </p> */}

        {/* Stats Display */}
        {/* <div className='flex justify-center gap-6 mb-8'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-red-600'>
                {stats.total}
              </div>
              <div className='text-sm text-muted-foreground'>Total Models</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {stats.bikes}
              </div>
              <div className='text-sm text-muted-foreground'>Motorcycles</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {stats.scooters}
              </div>
              <div className='text-sm text-muted-foreground'>Scooters</div>
            </div>
          </div> */}
        {/* </motion.div> */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='text-center mb-12'
        >
          <div className='flex items-center justify-center gap-2 mb-4'>
            <div className='h-1 w-12 bg-red-500 rounded-full' />
            <span className='text-red-600 text-sm font-semibold tracking-[0.2em] uppercase'>
              Our Vehicle Collection
            </span>
            <div className='h-1 w-12 bg-red-500 rounded-full' />
          </div>
          {/* <p className='text-3xl md:text-4xl font-bold tracking-tight mb-4'>
                   Calculate your monthly payments and explore financing options for
            your 
                     <span className='bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent ml-2'>
  new Honda motorcycle
            </span>
                  </p> */}
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto mb-6'>
            Discover our premium Honda motorcycles and scooters, engineered for
            performance and designed for the future.
          </p>
        </motion.div>

        {/* Filters and Controls */}
        <motion.div
          className='mb-8'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className='flex flex-col md:flex-row items-center justify-between gap-4 mb-6'>
            {/* Category Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={(value: any) => setActiveTab(value)}
            >
              <TabsList className='grid w-full grid-cols-3 md:w-auto'>
                <TabsTrigger value='all' className='flex items-center gap-2'>
                  <Filter className='h-4 w-4' />
                  All Vehicles
                  <Badge variant='secondary' className='ml-1'>
                    {stats.total}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value='bike' className='flex items-center gap-2'>
                  <Bike className='h-4 w-4' />
                  Motorcycles
                  <Badge variant='secondary' className='ml-1'>
                    {stats.bikes}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value='scooter'
                  className='flex items-center gap-2'
                >
                  <Car className='h-4 w-4' />
                  Scooters
                  <Badge variant='secondary' className='ml-1'>
                    {stats.scooters}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* View Mode Toggle */}
            <div className='flex items-center gap-2'>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size='sm'
                onClick={() => setViewMode("grid")}
              >
                <Grid className='h-4 w-4' />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size='sm'
                onClick={() => setViewMode("list")}
              >
                <List className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <Tabs value={activeTab}>
          <TabsContent value={activeTab} className='mt-0'>
            {isLoading ? (
              // Loading skeleton
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}
              >
                {Array.from({ length: 8 }).map((_, index) => (
                  <CardSkeleton key={index} />
                ))}
              </div>
            ) : vehicles.length === 0 ? (
              // No vehicles available
              <motion.div
                className='text-center py-16'
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className='bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6'>
                  {activeTab === "bike" ? (
                    <Bike className='h-12 w-12 text-gray-400' />
                  ) : activeTab === "scooter" ? (
                    <Car className='h-12 w-12 text-gray-400' />
                  ) : (
                    <Filter className='h-12 w-12 text-gray-400' />
                  )}
                </div>
                <h3 className='text-xl font-semibold mb-2'>
                  No{" "}
                  {activeTab === "all"
                    ? "vehicles"
                    : activeTab === "bike"
                      ? "motorcycles"
                      : "scooters"}{" "}
                  available
                </h3>
                <p className='text-muted-foreground mb-6'>
                  Check back soon for new arrivals or explore our other
                  categories.
                </p>
                <div className='flex gap-3 justify-center'>
                  <Button
                    variant='outline'
                    onClick={() => setActiveTab("all")}
                    className='border-red-500 text-red-500 hover:bg-red-50'
                  >
                    View All Categories
                  </Button>
                  <Link to='/contact'>
                    <Button className='bg-red-600 hover:bg-red-700'>
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              // Display vehicles
              <motion.div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1 lg:grid-cols-2"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {vehicles.map((vehicle, index) => (
                  <motion.div
                    key={vehicle._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <BikeCard bike={vehicle} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        {vehicles.length > 0 && (
          <motion.div
            className='text-center mt-12'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link to='/view-all'>
                <Button
                  size='lg'
                  className='bg-red-600 hover:bg-red-700 text-white px-8'
                >
                  View All Models
                  <ArrowRight className='ml-2 h-5 w-5' />
                </Button>
              </Link>
              <Link to='/finance'>
                <Button
                  variant='outline'
                  size='lg'
                  className='border-red-500 text-red-500 hover:bg-red-50 px-8'
                >
                  Finance Options
                </Button>
              </Link>
            </div>

            <p className='text-sm text-muted-foreground mt-4'>
              Can't find what you're looking for?
              <Link to='/contact' className='text-red-600 hover:underline ml-1'>
                Contact our team
              </Link>{" "}
              for personalized assistance.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default AvailableModel;
