import { motion, AnimatePresence } from "framer-motion";
import { Filter, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "../Home/Footer";
import { Header } from "../Home/Header/Header";

import { CategoryTabs } from "./DetailsUIParts/CategoryTabs";
import { BikeCard } from "./DetailsUIParts/BikeCard";
import { NoResults } from "./DetailsUIParts/NoResults";
import { SortSelector } from "./DetailsUIParts/SortSelector";

// Redux
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { toggleFilterSidebar } from "../../redux-store/slices/uiSlice";
import {
  setViewMode,
  selectBikesViewMode,
  selectBikesFilters,
} from "../../redux-store/slices/BikeSystemSlice/bikesSlice";
import { useGetBikesQuery } from "@/redux-store/services/BikeSystemApi/bikeApi";

// Skeleton Components
const Skeleton = ({
  className = "",
  ...props
}: {
  className?: string;
  [key: string]: any;
}) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] rounded ${className}`}
      {...props}
    />
  );
};

const CardSkeleton = ({
  showImage = true,
  lines = 3,
}: {
  showImage?: boolean;
  lines?: number;
}) => {
  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm'>
      {showImage && <Skeleton className='w-full h-48 mb-4 rounded-md' />}
      <div className='space-y-3'>
        <Skeleton className='h-6 w-3/4' />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={`h-4 ${i === lines - 1 ? "w-1/2" : "w-full"}`}
          />
        ))}
      </div>
    </div>
  );
};

const SkeletonResults = ({
  viewMode,
  count = 6,
}: {
  viewMode: "grid" | "list";
  count?: number;
}) => {
  return (
    <motion.div
      key='skeleton-results'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </motion.div>
  );
};

export function ViewAllBikes() {
  const dispatch = useAppDispatch();
  const viewMode = useAppSelector(selectBikesViewMode);
  const filters = useAppSelector(selectBikesFilters);

  // Fetch bikes with current filters
  const {
    data: bikesResponse,
    isLoading,
    error,
    refetch,
  } = useGetBikesQuery(filters);

  const bikes = bikesResponse?.data?.bikes || [];
  const pagination = bikesResponse?.data?.pagination || null;

  const handleToggleFilter = () => {
    dispatch(toggleFilterSidebar());
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    dispatch(setViewMode(mode));
  };

  // Format count display
  const formatCount = (count: number) => {
    if (count === 1) return "1 motorcycle";
    return `${count} motorcycles`;
  };

  return (
    <>
      <Header />
      <section className='min-h-screen bg-background'>
        {/* Hero Section */}

        <div className='container mx-auto px-4 py-8'>
          {/* Category Tabs */}
          <CategoryTabs className='mb-8' />

          {/* Filters and Controls */}
          <div className='flex flex-col lg:flex-row gap-8'>
            {/* Sidebar */}

            {/* Main Content */}
            <div className='flex-1'>
              {/* Controls Bar */}
              <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
                <div className='flex items-center gap-4'>
                  <Button
                    variant='outline'
                    onClick={handleToggleFilter}
                    className='lg:hidden'
                  >
                    <Filter className='h-4 w-4 mr-2' />
                    Filters
                  </Button>

                  <div className='flex items-center gap-2'>
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size='sm'
                      onClick={() => handleViewModeChange("grid")}
                    >
                      <Grid className='h-4 w-4' />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size='sm'
                      onClick={() => handleViewModeChange("list")}
                    >
                      <List className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                <div className='flex items-center gap-4'>
                  {!isLoading && (
                    <span className='text-sm text-muted-foreground'>
                      {formatCount(bikes.length)}
                      {pagination &&
                        pagination.total !== bikes.length &&
                        ` of ${pagination.total} total`}
                    </span>
                  )}
                  <SortSelector />
                </div>
              </div>

              {/* Error State */}
              {error && (
                <div className='text-center py-12 border rounded-lg bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'>
                  <h3 className='text-lg font-medium mb-2 text-red-900 dark:text-red-100'>
                    Failed to load bikes
                  </h3>
                  <p className='text-red-700 dark:text-red-300 mb-4'>
                    There was an error loading the motorcycles. Please try
                    again.
                  </p>
                  <Button variant='outline' onClick={() => refetch()}>
                    Try Again
                  </Button>
                </div>
              )}

              {/* Results */}
              <AnimatePresence mode='wait'>
                {isLoading ? (
                  <SkeletonResults viewMode={viewMode} />
                ) : bikes.length === 0 && !error ? (
                  <NoResults />
                ) : (
                  <motion.div
                    key='results'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                        : "space-y-4"
                    }
                  >
                    {bikes.map((bike) => (
                      <BikeCard key={bike._id} bike={bike} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className='flex justify-center mt-8 gap-2'>
                  <span className='flex items-center px-4 text-sm text-muted-foreground'>
                    Page {pagination.current} of {pagination.pages}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
