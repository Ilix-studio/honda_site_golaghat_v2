import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";

import { formatCurrency } from "../../../lib/formatters";

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
  selectedBrand?: string;
  setSelectedBrand?: (brand: string) => void;
  selectedFuelType?: string;
  setSelectedFuelType?: (fuelType: string) => void;
  availabilityFilter?: string;
  setAvailabilityFilter?: (availability: string) => void;
}

const hondaBrands = [
  "Honda",
  "Honda Motorcycle",
  "Honda Scooter",
  "Honda Premium",
];

const fuelTypes = ["Petrol", "Electric", "Hybrid"];

const availabilityOptions = [
  { value: "all", label: "All Vehicles" },
  { value: "in-stock", label: "In Stock" },
  { value: "pre-order", label: "Pre-Order" },
  { value: "coming-soon", label: "Coming Soon" },
];

export function FilterSidebar({
  priceRange,
  setPriceRange,
  engineSizeRange,
  setEngineSizeRange,
  selectedFeatures,
  toggleFeature,
  resetFilters,
  showOnMobile,
  selectedBrand = "all",
  setSelectedBrand,
  selectedFuelType = "all",
  setSelectedFuelType,
  availabilityFilter = "all",
  setAvailabilityFilter,
}: FilterSidebarProps) {
  return (
    <motion.div
      className={`lg:w-1/4 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${
        showOnMobile ? "block" : "hidden lg:block"
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <h3 className='text-lg font-bold text-gray-900 dark:text-white'>
          Filters
        </h3>
        <Button
          variant='ghost'
          size='sm'
          onClick={resetFilters}
          className='text-sm text-red-600 hover:text-red-700 hover:bg-red-50'
        >
          Reset All
        </Button>
      </div>

      <div className='space-y-6'>
        {/* Search */}

        <Separator />

        {/* Brand Filter */}
        {setSelectedBrand && (
          <div>
            <Label className='text-sm font-medium mb-3 block'>Brand</Label>
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select brand' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Brands</SelectItem>
                {hondaBrands.map((brand) => (
                  <SelectItem key={brand} value={brand.toLowerCase()}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Availability Filter */}
        {setAvailabilityFilter && (
          <div>
            <Label className='text-sm font-medium mb-3 block'>
              Availability
            </Label>
            <Select
              value={availabilityFilter}
              onValueChange={setAvailabilityFilter}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select availability' />
              </SelectTrigger>
              <SelectContent>
                {availabilityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Separator />

        {/* Price Range */}
        <div>
          <div className='flex justify-between mb-3'>
            <Label htmlFor='price-range' className='text-sm font-medium'>
              Price Range
            </Label>
            <span className='text-sm text-muted-foreground font-medium'>
              {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
            </span>
          </div>
          <Slider
            id='price-range'
            min={0}
            max={2000000}
            step={10000}
            value={priceRange}
            onValueChange={setPriceRange}
            className='w-full'
          />
          <div className='flex justify-between text-xs text-muted-foreground mt-1'>
            <span>₹0</span>
            <span>₹20L+</span>
          </div>
        </div>

        {/* Engine Size */}
        <div>
          <div className='flex justify-between mb-3'>
            <Label htmlFor='engine-size' className='text-sm font-medium'>
              Engine Size (cc)
            </Label>
            <span className='text-sm text-muted-foreground font-medium'>
              {engineSizeRange[0]} - {engineSizeRange[1]}cc
            </span>
          </div>
          <Slider
            id='engine-size'
            min={0}
            max={2000}
            step={50}
            value={engineSizeRange}
            onValueChange={setEngineSizeRange}
            className='w-full'
          />
          <div className='flex justify-between text-xs text-muted-foreground mt-1'>
            <span>0cc</span>
            <span>2000cc+</span>
          </div>
        </div>

        {/* Fuel Type */}
        {setSelectedFuelType && (
          <div>
            <Label className='text-sm font-medium mb-3 block'>Fuel Type</Label>
            <Select
              value={selectedFuelType}
              onValueChange={setSelectedFuelType}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select fuel type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                {fuelTypes.map((type) => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Separator />

        {/* Features */}
        <div>
          <Label className='text-sm font-medium mb-3 block'>
            Features ({selectedFeatures.length} selected)
          </Label>
          <div className='space-y-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'></div>

          {selectedFeatures.length > 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() =>
                selectedFeatures.forEach((feature) => toggleFeature(feature))
              }
              className='w-full mt-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50'
            >
              Clear All Features
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Close Button */}
      {showOnMobile && (
        <div className='lg:hidden mt-6 pt-4 border-t'>
          <Button
            variant='outline'
            className='w-full'
            onClick={() => {
              /* Close sidebar logic */
            }}
          >
            <X className='h-4 w-4 mr-2' />
            Close Filters
          </Button>
        </div>
      )}
    </motion.div>
  );
}
