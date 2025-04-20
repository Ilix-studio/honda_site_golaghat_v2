import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

import { SearchBar } from "./SearchBar";
import { formatCurrency } from "../../../lib/formatters";
import { availableFeatures } from "../../../mockdata/data";

interface FilterSidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  engineSizeRange: [number, number];
  setEngineSizeRange: (range: [number, number]) => void;
  selectedFeatures: string[];
  toggleFeature: (feature: string) => void;
  resetFilters: () => void;
  showOnMobile: boolean;
}

export function FilterSidebar({
  searchQuery,
  setSearchQuery,
  priceRange,
  setPriceRange,
  engineSizeRange,
  setEngineSizeRange,
  selectedFeatures,
  toggleFeature,
  resetFilters,
  showOnMobile,
}: FilterSidebarProps) {
  return (
    <motion.div
      className={`lg:w-1/4 bg-white p-6 rounded-lg border ${
        showOnMobile ? "block" : "hidden lg:block"
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className='flex justify-between items-center mb-6'>
        <h3 className='text-lg font-bold'>Filters</h3>
        <Button
          variant='ghost'
          size='sm'
          onClick={resetFilters}
          className='text-sm'
        >
          Reset All
        </Button>
      </div>

      <div className='space-y-6'>
        {/* Search */}
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Price Range */}
        <div>
          <div className='flex justify-between mb-2'>
            <Label htmlFor='price-range' className='text-sm font-medium'>
              Price Range
            </Label>
            <span className='text-sm text-muted-foreground'>
              {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
            </span>
          </div>
          <Slider
            id='price-range'
            min={0}
            max={30000}
            step={1000}
            value={priceRange}
            onValueChange={setPriceRange}
          />
        </div>

        {/* Engine Size */}
        <div>
          <div className='flex justify-between mb-2'>
            <Label htmlFor='engine-size' className='text-sm font-medium'>
              Engine Size (cc)
            </Label>
            <span className='text-sm text-muted-foreground'>
              {engineSizeRange[0]} - {engineSizeRange[1]}cc
            </span>
          </div>
          <Slider
            id='engine-size'
            min={0}
            max={2000}
            step={100}
            value={engineSizeRange}
            onValueChange={setEngineSizeRange}
          />
        </div>

        {/* Features */}
        <div>
          <Label className='text-sm font-medium mb-2 block'>Features</Label>
          <div className='space-y-2 max-h-[200px] overflow-y-auto pr-2'>
            {availableFeatures.map((feature) => (
              <div key={feature} className='flex items-center space-x-2'>
                <Checkbox
                  id={`feature-${feature}`}
                  checked={selectedFeatures.includes(feature)}
                  onCheckedChange={() => toggleFeature(feature)}
                />
                <label
                  htmlFor={`feature-${feature}`}
                  className='text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  {feature}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
