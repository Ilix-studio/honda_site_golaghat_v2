import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import { Filter, Grid, List, ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { Footer } from "../Home/Footer";
import { FilterSidebar } from "./DetailsUIParts/FilterSidebar";
import { CategoryTabs } from "./DetailsUIParts/CategoryTabs";
import { NoResults } from "./DetailsUIParts/NoResults";
import { SortSelector } from "./DetailsUIParts/SortSelector";
import { ActiveFilters } from "./DetailsUIParts/ActiveFilters";

// Redux
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  toggleFilterSidebar,
  selectIsFilterSidebarOpen,
} from "../../redux-store/slices/uiSlice";
import { useGetBikesQuery } from "../../redux-store/services/BikeSystemApi/bikeApi";
import { Header } from "../Home/Header/Header";
import { formatCurrency } from "../../lib/formatters";
import { Bike } from "../../redux-store/slices/BikeSystemSlice/bikesSlice";

// Skeleton Components
const Skeleton = ({ className = "", ...props }) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] rounded ${className}`}
      {...props}
    />
  );
};

// Enhanced BikeCard Component
interface BikeCardProps {
  bike: Bike;
}

const BikeCard: React.FC<BikeCardProps> = ({ bike }) => {
  const getPrimaryImageUrl = (): string => {
    if (bike?.images && Array.isArray(bike.images) && bike.images.length > 0) {
      const primaryImage = bike.images.find((img) => img.isPrimary);
      if (primaryImage?.src) return primaryImage.src;

      const firstImage = bike.images[0];
      if (firstImage?.src) return firstImage.src;
    }
    return "/api/placeholder/400/300";
  };

  const formatPrice = (): string => {
    const price =
      bike?.priceBreakdown?.onRoadPrice ||
      bike?.priceBreakdown?.exShowroomPrice;
    if (typeof price !== "number" || isNaN(price)) return "Price on Request";

    try {
      return formatCurrency(price);
    } catch {
      return `₹${price.toLocaleString("en-IN")}`;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className='group overflow-hidden border hover:shadow-lg transition-all duration-300 h-full'>
        <div className='relative'>
          <div className='aspect-video overflow-hidden bg-gray-100'>
            <img
              src={getPrimaryImageUrl()}
              alt={bike.modelName}
              className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/api/placeholder/400/300";
              }}
            />
          </div>

          {/* Stock Badge */}
          <div className='absolute top-3 right-3'>
            <Badge
              variant={bike.stockAvailable > 0 ? "default" : "destructive"}
              className='text-xs'
            >
              {bike.stockAvailable > 0 ? "In Stock" : "Out of Stock"}
            </Badge>
          </div>

          {/* Year Badge */}
          <div className='absolute top-3 left-3'>
            <Badge variant='outline' className='bg-white/90 text-xs'>
              {bike.year}
            </Badge>
          </div>
        </div>

        <CardContent className='p-4'>
          <div className='space-y-3'>
            {/* Model Name */}
            <h3 className='font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors'>
              {bike.modelName}
            </h3>

            {/* Price and Category */}
            <div className='flex justify-between items-center'>
              <Badge variant='outline' className='capitalize text-xs'>
                {bike.category}
              </Badge>
              <span className='text-lg font-bold text-primary'>
                {formatPrice()}
              </span>
            </div>

            {/* Key Specifications */}
            <div className='grid grid-cols-2 gap-2 text-sm text-muted-foreground'>
              <div>
                <span className='font-medium text-foreground'>Engine:</span>
                <br />
                <span>{bike.engineSize || "N/A"}</span>
              </div>
              <div>
                <span className='font-medium text-foreground'>Power:</span>
                <br />
                <span>{bike.power} HP</span>
              </div>
            </div>

            {/* Action Button */}
            <Link to={`/bike-details/${bike._id}`} className='block'>
              <Button
                className='w-full mt-4'
                variant={bike.stockAvailable > 0 ? "default" : "outline"}
                disabled={bike.stockAvailable === 0}
              >
                {bike.stockAvailable > 0 ? "View Details" : "Out of Stock"}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ViewAllBikes: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const isFilterSidebarOpen = useAppSelector(selectIsFilterSidebarOpen);

  // State management
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [engineSizeRange, setEngineSizeRange] = useState([0, 2000]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Build query parameters
  const queryParams = {
    page: 1,
    limit: 20,
    ...(selectedCategory !== "all" && { category: selectedCategory }),
    ...(priceRange[0] > 0 && { minPrice: priceRange[0] }),
    ...(priceRange[1] < 2000000 && { maxPrice: priceRange[1] }),
    ...(searchQuery && { search: searchQuery }),
    ...(sortBy !== "featured" && { sortBy }),
    inStock: true,
  };

  const {
    data: bikesResponse,
    isLoading,
    error,
    refetch,
  } = useGetBikesQuery(queryParams);

  const bikes = bikesResponse?.data?.bikes || [];
  const totalCount = bikesResponse?.data?.pagination?.total || 0;

  // Filter handlers
  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const resetFilters = () => {
    setSelectedCategory("all");
    setPriceRange([0, 2000000]);
    setEngineSizeRange([0, 2000]);
    setSelectedFeatures([]);
    setSearchQuery("");
    setSortBy("featured");
  };

  // Loading state
  if (isLoading) {
    return (
      <main className='min-h-screen flex flex-col'>
        <Header />
        <div className='container pt-28 pb-10 px-4 flex-grow'>
          <div className='mb-8'>
            <Skeleton className='h-8 w-64 mb-4' />
            <Skeleton className='h-4 w-96' />
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className='bg-white rounded-lg border p-4'>
                <Skeleton className='w-full h-48 mb-4' />
                <Skeleton className='h-6 w-3/4 mb-2' />
                <Skeleton className='h-4 w-1/2 mb-4' />
                <Skeleton className='h-10 w-full' />
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className='min-h-screen flex flex-col'>
        <Header />
        <div className='container pt-28 pb-10 px-4 flex-grow'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold mb-4'>
              Error Loading Motorcycles
            </h1>
            <p className='text-muted-foreground mb-4'>
              Unable to load motorcycle data. Please try again.
            </p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className='min-h-screen flex flex-col'>
      <Header />

      <div className='container pt-28 pb-10 px-4 flex-grow'>
        {/* Page Header */}
        <motion.div
          className='mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className='text-3xl font-bold mb-4'>All Motorcycles</h1>
          <p className='text-muted-foreground'>
            Discover our complete range of Honda motorcycles. Filter by
            category, price, or features to find your perfect ride.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <CategoryTabs
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Content Layout */}
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Sidebar */}
          <AnimatePresence>
            {isFilterSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.3 }}
                className='lg:w-80 flex-shrink-0'
              >
                {/* <FilterSidebar
                  priceRange={priceRange}
                  onPriceRangeChange={setPriceRange}
                  engineSizeRange={engineSizeRange}
                  onEngineSizeRangeChange={setEngineSizeRange}
                  selectedFeatures={selectedFeatures}
                  onFeatureToggle={toggleFeature}
                  searchQuery={searchQuery}
                  onSearchQueryChange={setSearchQuery}
                  onResetFilters={resetFilters}
                /> */}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className='flex-1'>
            {/* Controls Bar */}
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
              <div className='flex items-center gap-4'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => dispatch(toggleFilterSidebar())}
                  className='lg:hidden'
                >
                  <Filter className='h-4 w-4 mr-2' />
                  Filters
                </Button>

                <div className='text-sm text-muted-foreground'>
                  Showing {bikes.length} of {totalCount} motorcycles
                </div>
              </div>

              <div className='flex items-center gap-4'>
                {/* Sort Selector */}
                <SortSelector value={sortBy} onValueChange={setSortBy} />

                {/* View Mode Toggle */}
                <div className='flex border rounded-lg overflow-hidden'>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size='sm'
                    onClick={() => setViewMode("grid")}
                    className='rounded-none'
                  >
                    <Grid className='h-4 w-4' />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size='sm'
                    onClick={() => setViewMode("list")}
                    className='rounded-none'
                  >
                    <List className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            <ActiveFilters
              selectedCategory={selectedCategory}
              priceRange={priceRange}
              selectedFeatures={selectedFeatures}
              searchQuery={searchQuery}
              onRemoveCategory={() => setSelectedCategory("all")}
              onRemovePriceRange={() => setPriceRange([0, 2000000])}
              onRemoveFeature={toggleFeature}
              onRemoveSearch={() => setSearchQuery("")}
              onClearAll={resetFilters}
            />

            {/* Results */}
            {bikes.length === 0 ? (
              <NoResults onReset={resetFilters} />
            ) : (
              <motion.div
                layout
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }
              >
                <AnimatePresence mode='popLayout'>
                  {bikes.map((bike) => (
                    <BikeCard key={bike._id} bike={bike} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Load More Button */}
            {bikes.length > 0 && bikes.length < totalCount && (
              <div className='text-center mt-8'>
                <Button variant='outline' size='lg'>
                  Load More Motorcycles
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default ViewAllBikes;
