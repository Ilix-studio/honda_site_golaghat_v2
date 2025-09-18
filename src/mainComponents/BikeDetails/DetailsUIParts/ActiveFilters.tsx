import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchBar } from "./SearchBar";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import {
  setFilters,
  clearFilters,
  selectBikesFilters,
} from "../../../redux-store/slices/BikeSystemSlice/bikesSlice";

interface FilterSidebarProps {
  showOnMobile: boolean;
  className?: string;
}

export function FilterSidebar({ showOnMobile, className }: FilterSidebarProps) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectBikesFilters);

  const priceRange = [filters.minPrice || 0, filters.maxPrice || 2000000];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const categories = [
    { value: "sport", label: "Sport" },
    { value: "adventure", label: "Adventure" },
    { value: "cruiser", label: "Cruiser" },
    { value: "touring", label: "Touring" },
    { value: "naked", label: "Naked" },
    { value: "electric", label: "Electric" },
    { value: "commuter", label: "Commuter" },
    { value: "automatic", label: "Automatic" },
    { value: "gearless", label: "Gearless" },
  ];

  const fuelNorms = [
    { value: "BS4", label: "BS4" },
    { value: "BS6", label: "BS6" },
    { value: "BS6 Phase 2", label: "BS6 Phase 2" },
    { value: "Electric", label: "Electric" },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePriceChange = ([min, max]: number[]) => {
    dispatch(
      setFilters({
        minPrice: min > 0 ? min : undefined,
        maxPrice: max < 2000000 ? max : undefined,
      })
    );
  };

  const handleResetFilters = () => {
    dispatch(clearFilters());
  };

  return (
    <motion.div
      className={`lg:w-1/4 bg-white dark:bg-gray-800 p-6 rounded-lg border ${
        showOnMobile ? "block" : "hidden lg:block"
      } ${className || ""}`}
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
          onClick={handleResetFilters}
          className='text-sm'
        >
          Reset All
        </Button>
      </div>

      <div className='space-y-6'>
        {/* Search */}
        <SearchBar />

        {/* Main Category */}
        <div>
          <Label className='text-sm font-medium mb-2 block'>Vehicle Type</Label>
          <Select
            value={filters.mainCategory || "all"}
            onValueChange={(value) =>
              dispatch(
                setFilters({
                  mainCategory:
                    value === "all" ? undefined : (value as "bike" | "scooter"),
                })
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Select type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Types</SelectItem>
              <SelectItem value='bike'>Motorcycles</SelectItem>
              <SelectItem value='scooter'>Scooters</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div>
          <Label className='text-sm font-medium mb-2 block'>Category</Label>
          <Select
            value={filters.category || "all"}
            onValueChange={(value) =>
              dispatch(
                setFilters({ category: value === "all" ? undefined : value })
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Select category' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year */}
        <div>
          <Label className='text-sm font-medium mb-2 block'>Year</Label>
          <Select
            value={filters.year?.toString() || "all"}
            onValueChange={(value) =>
              dispatch(
                setFilters({
                  year: value === "all" ? undefined : parseInt(value),
                })
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Select year' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
            max={2000000}
            step={50000}
            value={priceRange}
            onValueChange={handlePriceChange}
            className='w-full'
          />
        </div>

        {/* Fuel Norms */}
        <div>
          <Label className='text-sm font-medium mb-2 block'>Fuel Norms</Label>
          <Select
            value={filters.fuelNorms || "all"}
            onValueChange={(value) =>
              dispatch(
                setFilters({
                  fuelNorms: value === "all" ? undefined : (value as any),
                })
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Select fuel norms' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Norms</SelectItem>
              {fuelNorms.map((norm) => (
                <SelectItem key={norm.value} value={norm.value}>
                  {norm.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Additional Filters */}
        <div className='space-y-3'>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='e20-efficient'
              checked={filters.isE20Efficiency || false}
              onCheckedChange={(checked) =>
                dispatch(
                  setFilters({ isE20Efficiency: checked ? true : undefined })
                )
              }
            />
            <Label htmlFor='e20-efficient' className='text-sm'>
              E20 Efficient
            </Label>
          </div>

          <div className='flex items-center space-x-2'>
            <Checkbox
              id='in-stock'
              checked={filters.inStock || false}
              onCheckedChange={(checked) =>
                dispatch(setFilters({ inStock: checked ? true : undefined }))
              }
            />
            <Label htmlFor='in-stock' className='text-sm'>
              In Stock Only
            </Label>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
