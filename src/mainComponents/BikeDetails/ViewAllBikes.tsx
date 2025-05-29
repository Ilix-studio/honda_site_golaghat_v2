import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PlusCircle, SlidersHorizontal } from "lucide-react";

import { useFilteredBikes } from "@/hooks/useFilteredBikes";
import { SortSelector } from "./DetailsUIParts/SortSelector";
import { FilterSidebar } from "./DetailsUIParts/FilterSidebar";
import { CategoryTabs } from "./DetailsUIParts/CategoryTabs";
import { ActiveFilters } from "./DetailsUIParts/ActiveFilters";
import { BikeCard } from "./DetailsUIParts/BikeCard";
import { NoResults } from "./DetailsUIParts/NoResults";

export function ViewAllBikes() {
  const [showFilters, setShowFilters] = useState(false);

  const {
    filteredBikes,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    engineSizeRange,
    setEngineSizeRange,
    selectedFeatures,
    toggleFeature,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    resetFilters,
  } = useFilteredBikes();

  return (
    <section className='py-20'>
      {/* <header className='bg-white border-b shadow-sm'>
        <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
a
          <Button
            variant='ghost'
            onClick={() => Navigate("/admin/dashboard")}
            className='text-gray-600'
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Dashboard
          </Button>
        </div>
      </header> */}
      <div className='container px-4 md:px-6'>
        <motion.div
          className='flex flex-row justify-between items-center mb-12 w-full'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className='text-3xl font-bold tracking-tight'>
            All Honda Motorcycles
          </h2>
          <Button className='bg-red-600 hover:bg-red-700 text-white font-medium px-6'>
            <PlusCircle className='mr-2 h-4 w-4' /> Add New Bikes
          </Button>
        </motion.div>

        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Mobile filter toggle */}
          <div className='lg:hidden flex justify-between items-center mb-4'>
            <Button
              variant='outline'
              onClick={() => setShowFilters(!showFilters)}
              className='flex items-center gap-2'
            >
              <SlidersHorizontal className='h-4 w-4' />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>

            <SortSelector sortBy={sortBy} setSortBy={setSortBy} />
          </div>

          {/* Filters sidebar */}
          <AnimatePresence>
            {(showFilters ||
              (typeof window !== "undefined" && window.innerWidth >= 1024)) && (
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
                showOnMobile={showFilters}
              />
            )}
          </AnimatePresence>

          {/* Main content */}
          <div className='lg:w-3/4'>
            {/* Desktop category tabs and sort */}
            <div className='hidden lg:flex justify-between items-center mb-6'>
              <CategoryTabs
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                className='w-auto'
              />

              <SortSelector sortBy={sortBy} setSortBy={setSortBy} />
            </div>

            {/* Mobile category tabs */}
            <div className='lg:hidden mb-6'>
              <CategoryTabs
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                className='w-full'
              />
            </div>

            {/* Results count */}
            <div className='mb-6 text-sm text-muted-foreground'>
              Showing {filteredBikes.length}{" "}
              {filteredBikes.length === 1 ? "bike" : "bikes"}
              {/* Active filters */}
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
            </div>

            {/* Bikes grid */}
            {filteredBikes.length > 0 ? (
              <motion.div
                className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                layout
              >
                <AnimatePresence>
                  {filteredBikes.map((bike) => (
                    <BikeCard key={bike.id} bike={bike} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <NoResults resetFilters={resetFilters} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
