import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { allBikes } from "../mockdata/data";

export function useFilteredBikes() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state with URL parameters if available
  const initialSearchQuery = searchParams.get("search") || "";

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 30000]);
  const [engineSizeRange, setEngineSizeRange] = useState<[number, number]>([
    0, 2000,
  ]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [sortBy, setSortBy] = useState("featured");

  // Update URL when search query changes
  useEffect(() => {
    if (searchQuery) {
      searchParams.set("search", searchQuery);
    } else {
      searchParams.delete("search");
    }
    setSearchParams(searchParams);
  }, [searchQuery, setSearchParams]);

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory("all");
    setPriceRange([0, 30000]);
    setEngineSizeRange([0, 2000]);
    setSelectedFeatures([]);
    setSearchQuery("");
    setSortBy("featured");
  };

  // Toggle a feature in the selected features array
  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  // Apply filters and sorting to bikes
  const filteredBikes = useMemo(() => {
    // Start with all bikes
    let filtered = [...allBikes];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((bike) => bike.category === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter(
      (bike) => bike.price >= priceRange[0] && bike.price <= priceRange[1]
    );

    // Filter by engine size range
    filtered = filtered.filter(
      (bike) =>
        bike.engineSize >= engineSizeRange[0] &&
        bike.engineSize <= engineSizeRange[1]
    );

    // Filter by selected features
    if (selectedFeatures.length > 0) {
      filtered = filtered.filter((bike) =>
        selectedFeatures.every((feature) => bike.features.includes(feature))
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (bike) =>
          bike.name.toLowerCase().includes(query) ||
          bike.category.toLowerCase().includes(query) ||
          bike.features.some((feature) => feature.toLowerCase().includes(query))
      );
    }

    // Sort bikes
    switch (sortBy) {
      case "price-low":
        return filtered.sort((a, b) => a.price - b.price);
      case "price-high":
        return filtered.sort((a, b) => b.price - a.price);
      case "newest":
        return filtered.sort((a, b) => b.year - a.year);
      case "engine-size":
        return filtered.sort((a, b) => b.engineSize - a.engineSize);
      case "power":
        return filtered.sort((a, b) => b.power - a.power);
      default:
        // 'featured' - no specific sorting, use default order
        return filtered;
    }
  }, [
    selectedCategory,
    priceRange,
    engineSizeRange,
    selectedFeatures,
    searchQuery,
    sortBy,
  ]);

  // Custom setter for search query that also updates URL
  const setSearchQueryWithUrl = (query: string) => {
    setSearchQuery(query);
  };

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
    setSearchQuery: setSearchQueryWithUrl,
    sortBy,
    setSortBy,
    resetFilters,
  };
}
