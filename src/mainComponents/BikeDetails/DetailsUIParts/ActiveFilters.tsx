import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "../../../lib/formatters";
import { categories } from "../../../constants/formOptions";

interface ActiveFiltersProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  engineSizeRange: [number, number];
  setEngineSizeRange: (range: [number, number]) => void;
  selectedFeatures: string[];
  toggleFeature: (feature: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function ActiveFilters({
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
}: ActiveFiltersProps) {
  const hasActiveFilters =
    selectedCategory !== "all" ||
    priceRange[0] > 0 ||
    priceRange[1] < 30000 ||
    engineSizeRange[0] > 0 ||
    engineSizeRange[1] < 2000 ||
    selectedFeatures.length > 0 ||
    searchQuery;

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className='flex flex-wrap gap-2 mt-2'>
      {selectedCategory !== "all" && (
        <Badge variant='outline' className='flex items-center gap-1'>
          Category: {categories.find((c) => c.id === selectedCategory)?.name}
          <button onClick={() => setSelectedCategory("all")}>
            <X className='h-3 w-3' />
          </button>
        </Badge>
      )}

      {(priceRange[0] > 0 || priceRange[1] < 30000) && (
        <Badge variant='outline' className='flex items-center gap-1'>
          Price: {formatCurrency(priceRange[0])} -{" "}
          {formatCurrency(priceRange[1])}
          <button onClick={() => setPriceRange([0, 30000])}>
            <X className='h-3 w-3' />
          </button>
        </Badge>
      )}

      {(engineSizeRange[0] > 0 || engineSizeRange[1] < 2000) && (
        <Badge variant='outline' className='flex items-center gap-1'>
          Engine: {engineSizeRange[0]}cc - {engineSizeRange[1]}cc
          <button onClick={() => setEngineSizeRange([0, 2000])}>
            <X className='h-3 w-3' />
          </button>
        </Badge>
      )}

      {selectedFeatures.map((feature) => (
        <Badge
          key={feature}
          variant='outline'
          className='flex items-center gap-1'
        >
          {feature}
          <button onClick={() => toggleFeature(feature)}>
            <X className='h-3 w-3' />
          </button>
        </Badge>
      ))}

      {searchQuery && (
        <Badge variant='outline' className='flex items-center gap-1'>
          Search: {searchQuery}
          <button onClick={() => setSearchQuery("")}>
            <X className='h-3 w-3' />
          </button>
        </Badge>
      )}
    </div>
  );
}
