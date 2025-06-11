import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { Filter, Grid, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { FilterSidebar } from "./DetailsUIParts/FilterSidebar";
import { CategoryTabs } from "./DetailsUIParts/CategoryTabs";
import { BikeCard } from "./DetailsUIParts/BikeCard";
import { NoResults } from "./DetailsUIParts/NoResults";
import { SortSelector } from "./DetailsUIParts/SortSelector";
import { ActiveFilters } from "./DetailsUIParts/ActiveFilters";

// Redux
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  toggleFilterSidebar,
  selectIsFilterSidebarOpen,
} from "../../redux-store/slices/uiSlice";
import { useSearchBikesQuery } from "../../redux-store/services/bikeApi";

export function ViewAllBikes() {
  const dispatch = useAppDispatch();
  const isFilterSidebarOpen = useAppSelector(selectIsFilterSidebarOpen);
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [engineSizeRange, setEngineSizeRange] = useState<[number, number]>([
    0, 2000,
  ]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  // Initialize search query from URL params
  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam && searchQuery !== searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams, searchQuery]);

  // Build search filters object
  const searchFilters = {
    ...(selectedCategory !== "all" && { category: selectedCategory }),
    ...(priceRange[0] > 0 && { minPrice: priceRange[0] }),
    ...(priceRange[1] < 2000000 && { maxPrice: priceRange[1] }),
    ...(searchQuery && { search: searchQuery }),
    ...(selectedFeatures.length > 0 && { features: selectedFeatures }),
    sortBy,
    page: 1,
    limit: 50, // Adjust as needed
  };

  // Use the search bikes query with filters
  const {
    data: bikesResponse,
    isLoading,
    error,
    refetch,
  } = useSearchBikesQuery(searchFilters);

  const filteredBikes = bikesResponse?.data || [];

  const handleToggleFilter = () => {
    dispatch(toggleFilterSidebar());
  };

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

  if (isLoading) {
    return (
      <main className='min-h-screen flex flex-col'>
        <Header />
        <div className='flex-grow flex items-center justify-center'>
          <div className='animate-spin h-8 w-8 border-4 border-red-600 rounded-full border-t-transparent'></div>
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
          setSelectedCategory={setSelectedCategory}
          className='mb-8'
        />

        {/* Filters and Controls */}
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Sidebar */}
          <FilterSidebar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            engineSizeRange={engineSizeRange}
            setEngineSizeRange={setEngineSizeRange}
            selectedFeatures={selectedFeatures}
            toggleFeature={toggleFeature}
            resetFilters={resetFilters}
            showOnMobile={isFilterSidebarOpen}
          />

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

              <div className='flex items-center gap-4'>
                <span className='text-sm text-muted-foreground'>
                  {filteredBikes.length} motorcycles found
                </span>
                <SortSelector sortBy={sortBy} setSortBy={setSortBy} />
              </div>
            </div>

            {/* Active Filters */}
            <ActiveFilters
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              engineSizeRange={engineSizeRange}
              setEngineSizeRange={setEngineSizeRange}
              selectedFeatures={selectedFeatures}
              toggleFeature={toggleFeature}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

            {/* Results */}
            <AnimatePresence mode='wait'>
              {filteredBikes.length === 0 ? (
                <NoResults resetFilters={resetFilters} />
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
                  {filteredBikes.map((bike) => (
                    <BikeCard key={bike.id} bike={bike} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
