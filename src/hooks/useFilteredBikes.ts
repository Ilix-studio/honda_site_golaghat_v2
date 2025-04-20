import { allBikes, Bike } from "../mockdata/data";
import { useState, useEffect } from "react";

export function useFilteredBikes() {
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 30000]);
  const [engineSizeRange, setEngineSizeRange] = useState<[number, number]>([
    0, 2000,
  ]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [filteredBikes, setFilteredBikes] = useState<Bike[]>(allBikes);

  // Toggle feature selection
  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory("all");
    setPriceRange([0, 30000]);
    setEngineSizeRange([0, 2000]);
    setSelectedFeatures([]);
    setSearchQuery("");
  };

  // Apply filters
  useEffect(() => {
    let result = [...allBikes];

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((bike) => bike.category === selectedCategory);
    }

    // Filter by price range
    result = result.filter(
      (bike) => bike.price >= priceRange[0] && bike.price <= priceRange[1]
    );

    // Filter by engine size
    result = result.filter(
      (bike) =>
        bike.engineSize >= engineSizeRange[0] &&
        bike.engineSize <= engineSizeRange[1]
    );

    // Filter by features
    if (selectedFeatures.length > 0) {
      result = result.filter((bike) =>
        selectedFeatures.every((feature) => bike.features.includes(feature))
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (bike) =>
          bike.name.toLowerCase().includes(query) ||
          bike.category.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => b.year - a.year);
        break;
      case "engine-size":
        result.sort((a, b) => b.engineSize - a.engineSize);
        break;
      case "power":
        result.sort((a, b) => b.power - a.power);
        break;
      default:
        // Featured sorting (new bikes first, then by price)
        result.sort((a, b) => {
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return b.price - a.price;
        });
    }

    setFilteredBikes(result);
  }, [
    selectedCategory,
    priceRange,
    engineSizeRange,
    selectedFeatures,
    searchQuery,
    sortBy,
  ]);

  return {
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
  };
}
