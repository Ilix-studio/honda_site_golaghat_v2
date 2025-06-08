import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, SlidersHorizontal, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { BikeCard } from "./DetailsUIParts/BikeCard";
import { FilterSidebar } from "./DetailsUIParts/FilterSidebar";
import { CategoryTabs } from "./DetailsUIParts/CategoryTabs";
import { SortSelector } from "./DetailsUIParts/SortSelector";
import { ActiveFilters } from "./DetailsUIParts/ActiveFilters";
import { NoResults } from "./DetailsUIParts/NoResults";

// Redux hooks
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { useBikes } from "../../hooks/useBikes";
import {
  setFilters,
  setSortBy,
  setPagination,
  resetFilters,
  selectBikesFilters,
  selectBikesSortBy,
} from "../../redux-store/slices/bikesSlice";
import {
  toggleFilterSidebar,
  setFilterSidebarOpen,
  selectIsFilterSidebarOpen,
} from "../../redux-store/slices/uiSlice";

export function ViewAllBikes() {
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Redux state
  const filters = useAppSelector(selectBikesFilters);
  const sortBy = useAppSelector(selectBikesSortBy);
  const showFilterSidebar = useAppSelector(selectIsFilterSidebarOpen);

  // Custom hooks - getting data from API
  const { bikes, loading, error, pagination } = useBikes();

  // Filter handlers
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    dispatch(setFilters(newFilters));
    dispatch(setPagination({ page: 1 })); // Reset to first page when filters change
  };

  const handleSortChange = (newSortBy: string) => {
    dispatch(setSortBy(newSortBy));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  const toggleFeature = (feature: string) => {
    const currentFeatures = filters.selectedFeatures || [];
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter((f) => f !== feature)
      : [...currentFeatures, feature];

    updateFilters({ selectedFeatures: newFeatures });
  };

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        dispatch(setFilterSidebarOpen(false));
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  if (loading) {
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
        <div className='flex-grow flex items-center justify-center'>
          <div className='text-center'>
            <h2 className='text-xl font-semibold mb-2'>Error Loading Bikes</h2>
            <p className='text-muted-foreground'>{error}</p>
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
            Discover our complete range of Honda motorcycles
          </p>
        </motion.div>

        {/* Category Tabs */}
        <CategoryTabs
          selectedCategory={filters.category || "all"}
          setSelectedCategory={(category) => updateFilters({ category })}
          className='mb-6'
        />

        {/* Controls Bar */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
          <div className='flex items-center gap-2'>
            {/* Mobile Filter Toggle */}
            <Button
              variant='outline'
              size='sm'
              className='lg:hidden'
              onClick={() => dispatch(toggleFilterSidebar())}
            >
              <Filter className='h-4 w-4 mr-2' />
              Filters
            </Button>

            {/* Advanced Filters Toggle for Desktop */}
            <Button
              variant='outline'
              size='sm'
              className='hidden lg:flex'
              onClick={() => dispatch(toggleFilterSidebar())}
            >
              <SlidersHorizontal className='h-4 w-4 mr-2' />
              {showFilterSidebar ? "Hide" : "Show"} Filters
            </Button>

            {/* Results Count */}
            <span className='text-sm text-muted-foreground'>
              {pagination.total} bikes found
            </span>
          </div>

          <div className='flex items-center gap-2'>
            {/* Sort Selector */}
            <SortSelector sortBy={sortBy} setSortBy={handleSortChange} />

            {/* View Mode Toggle */}
            <div className='hidden sm:flex border rounded-md'>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size='sm'
                onClick={() => setViewMode("grid")}
                className='rounded-r-none'
              >
                <Grid className='h-4 w-4' />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size='sm'
                onClick={() => setViewMode("list")}
                className='rounded-l-none'
              >
                <List className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        <ActiveFilters
          selectedCategory={filters.category || "all"}
          setSelectedCategory={(category) => updateFilters({ category })}
          priceRange={[filters.minPrice || 0, filters.maxPrice || 30000]}
          setPriceRange={([min, max]) =>
            updateFilters({ minPrice: min, maxPrice: max })
          }
          engineSizeRange={[0, 2000]} // You'll need to add this to your filters
          setEngineSizeRange={() => {}} // Implement this
          selectedFeatures={filters.selectedFeatures || []}
          toggleFeature={toggleFeature}
          searchQuery={filters.search || ""}
          setSearchQuery={(search) => updateFilters({ search })}
        />

        {/* Main Content */}
        <div className='flex gap-8'>
          {/* Filter Sidebar */}
          <AnimatePresence>
            {showFilterSidebar && (
              <FilterSidebar
                searchQuery={filters.search || ""}
                setSearchQuery={(search) => updateFilters({ search })}
                priceRange={[filters.minPrice || 0, filters.maxPrice || 30000]}
                setPriceRange={([min, max]) =>
                  updateFilters({ minPrice: min, maxPrice: max })
                }
                engineSizeRange={[0, 2000]}
                setEngineSizeRange={() => {}}
                selectedFeatures={filters.selectedFeatures || []}
                toggleFeature={toggleFeature}
                resetFilters={handleResetFilters}
                showOnMobile={true}
              />
            )}
          </AnimatePresence>

          {/* Bikes Grid/List */}
          <div className='flex-1'>
            {bikes.length > 0 ? (
              <motion.div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-6"
                }
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {bikes.map((bike) => (
                  <BikeCard key={bike.id} bike={bike} />
                ))}
              </motion.div>
            ) : (
              <NoResults resetFilters={handleResetFilters} />
            )}

            {/* Pagination would go here */}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
