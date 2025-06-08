import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  PlusCircle,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Printer,
  Share2,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { AddBikeCard } from "./AddBikeCard";
import { BikeComparisonCard } from "./BikeComparisonCard";
import { Header } from "@/mainComponents/Header";
import { formatCurrency } from "@/lib/formatters";
import { Footer } from "@/mainComponents/Footer";
import { comparisonSections } from "./comparisonSections";
import { useGetBikesQuery } from "@/redux-store/services/bikeApi";
import { Bike } from "@/redux-store/slices/bikesSlice"; // Use the Redux Bike type

// Define constants for categories - you may need to adjust this based on your actual categories
const CATEGORIES = [
  "all",
  "sport",
  "adventure",
  "cruiser",
  "touring",
  "naked",
  "electric",
];

const EMPTY_SLOT_PLACEHOLDER = "add-bike";

// Viewport breakpoints
const VIEWPORT_BREAKPOINTS = {
  MOBILE: 640, // sm breakpoint in Tailwind
  TABLET: 1024, // lg breakpoint in Tailwind
};

// Maximum bikes to compare by viewport
const MAX_BIKES = {
  MOBILE: 2,
  TABLET: 3,
  DESKTOP: 4,
};

// Create an extended type for comparison with additional properties
interface ComparisonBike extends Bike {
  name?: string; // Make it optional since it might not exist in the API data
  engineSize?: number; // Make it optional since it might not exist in the API data
  image?: string; // Make it optional
}

export default function CompareBike() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get bikes data from API
  const { data: bikesResponse, isLoading } = useGetBikesQuery({});
  const allBikes: ComparisonBike[] = bikesResponse?.data || [];

  // Get bike IDs from URL parameters
  const bikeIds = searchParams.getAll("bikes") || [];

  // State to track viewport size
  const [viewport, setViewport] = useState<"MOBILE" | "TABLET" | "DESKTOP">(
    "DESKTOP"
  );

  // Determine max bikes based on viewport
  const getMaxBikes = () => {
    switch (viewport) {
      case "MOBILE":
        return MAX_BIKES.MOBILE;
      case "TABLET":
        return MAX_BIKES.TABLET;
      default:
        return MAX_BIKES.DESKTOP;
    }
  };

  // State for selected bikes (using IDs with placeholders for empty slots)
  const [selectedBikeIds, setSelectedBikeIds] = useState<string[]>([]);

  // Actual bike objects corresponding to the selected IDs
  const [selectedBikes, setSelectedBikes] = useState<(ComparisonBike | null)[]>(
    []
  );

  // State for category filter in the bike selector
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // State for search input in the bike selector
  const [searchQuery, setSearchQuery] = useState("");

  // State for which specification sections are expanded (for mobile view)
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    engine: true,
    dimensions: true,
    features: true,
  });

  // Handle viewport changes
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < VIEWPORT_BREAKPOINTS.MOBILE) {
        setViewport("MOBILE");
      } else if (width < VIEWPORT_BREAKPOINTS.TABLET) {
        setViewport("TABLET");
      } else {
        setViewport("DESKTOP");
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize bike slots based on viewport and URL params
  useEffect(() => {
    const maxBikes = getMaxBikes();

    // Filter valid bike IDs to match max bikes for current viewport
    const validBikeIds = bikeIds.slice(0, maxBikes);

    // Create array with valid bikes and empty slots to fill the grid
    const initialSelectedBikeIds = [...validBikeIds];

    // Add empty slots to fill the grid
    while (initialSelectedBikeIds.length < maxBikes) {
      initialSelectedBikeIds.push(EMPTY_SLOT_PLACEHOLDER);
    }

    setSelectedBikeIds(initialSelectedBikeIds);
  }, [bikeIds, viewport]);

  // Toggle expanded sections on mobile
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Filter bikes based on category and search query for bike selector
  const filteredBikes = allBikes.filter(
    (bike) =>
      (categoryFilter === "all" || bike.category === categoryFilter) &&
      (searchQuery === "" ||
        bike.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bike.name &&
          bike.name.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Update selected bikes whenever the IDs change
  useEffect(() => {
    const bikes = selectedBikeIds.map((id) => {
      if (id === EMPTY_SLOT_PLACEHOLDER) {
        return null;
      }

      const foundBike = allBikes.find((bike) => bike.id === id);
      if (!foundBike) return null;

      // Create a complete comparison bike object with fallback values
      const comparisonBike: ComparisonBike = {
        ...foundBike,
        name: foundBike.name || foundBike.modelName, // Use modelName as fallback for name
        engineSize: foundBike.engineSize || parseInt(foundBike.engine) || 0, // Extract from engine string if needed
        image: foundBike.images?.[0] || "/placeholder.svg", // Use first image or placeholder
      };

      return comparisonBike;
    });

    setSelectedBikes(bikes);

    // Update URL parameters with only real bike IDs (not placeholders)
    const validBikeIds = selectedBikeIds.filter(
      (id) => id !== EMPTY_SLOT_PLACEHOLDER
    );

    if (validBikeIds.length > 0) {
      setSearchParams({ bikes: validBikeIds });
    } else {
      navigate("/compare"); // Clear parameters if no bikes are selected
    }
  }, [selectedBikeIds, setSearchParams, navigate, allBikes]);

  // Remove a bike from comparison
  const removeBike = (index: number) => {
    const newSelectedBikeIds = [...selectedBikeIds];
    newSelectedBikeIds[index] = EMPTY_SLOT_PLACEHOLDER;
    setSelectedBikeIds(newSelectedBikeIds);
  };

  // Add empty slot if we have fewer than max bikes
  const addEmptySlot = () => {
    const maxBikes = getMaxBikes();
    if (selectedBikeIds.length < maxBikes) {
      setSelectedBikeIds([...selectedBikeIds, EMPTY_SLOT_PLACEHOLDER]);
    }
  };

  // Print the comparison
  const handlePrint = () => {
    window.print();
  };

  // Share the comparison
  const handleShare = () => {
    // Create a shareable URL
    const url = window.location.href;

    // Use the Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: "Honda Motorcycles Comparison",
        text: "Check out this motorcycle comparison!",
        url: url,
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(url).then(() => {
        alert("Comparison link copied to clipboard!");
      });
    }
  };

  // Find best value for a particular spec across all bikes
  const findBestValue = (
    key: keyof ComparisonBike,
    isHigherBetter: boolean = true
  ): number => {
    const values = selectedBikes
      .filter((bike) => bike !== null)
      .map((bike) => {
        if (!bike) return 0;
        const value = bike[key];
        return typeof value === "number" ? value : 0;
      });

    if (values.length === 0) return 0;
    return isHigherBetter ? Math.max(...values) : Math.min(...values);
  };

  // Helper to determine if a spec value is the best
  const isBestValue = (
    value: number,
    key: keyof ComparisonBike,
    isHigherBetter: boolean = true
  ): boolean => {
    if (!value) return false;
    const bestValue = findBestValue(key, isHigherBetter);
    return value === bestValue;
  };

  // Compare values and return the appropriate indicator
  const getComparisonIndicator = (
    bike: ComparisonBike | null,
    key: keyof ComparisonBike,
    isHigherBetter: boolean = true
  ) => {
    if (!bike) return null;

    const value = bike[key];
    const numericValue = typeof value === "number" ? value : 0;

    if (isBestValue(numericValue, key, isHigherBetter)) {
      return (
        <span
          className='text-green-500 flex items-center'
          title='Best in comparison'
        >
          <TrendingUp className='h-4 w-4' />
        </span>
      );
    }

    // Only show negative indicator if there are more than 1 bike being compared
    const bikesWithValues = selectedBikes.filter((b) => b !== null).length;
    if (bikesWithValues > 1) {
      const bestValue = findBestValue(key, isHigherBetter);
      const worstValue = findBestValue(key, !isHigherBetter);

      if (
        (isHigherBetter && numericValue === worstValue) ||
        (!isHigherBetter && numericValue === bestValue)
      ) {
        return (
          <span
            className='text-red-500 flex items-center'
            title='Lowest in comparison'
          >
            <TrendingDown className='h-4 w-4' />
          </span>
        );
      }
    }

    return <Minus className='h-4 w-4 text-gray-300' />;
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

  return (
    <main className='min-h-screen flex flex-col'>
      <Header />

      <div className='container py-10 px-4 flex-grow pt-20'>
        <div className='mb-6'>
          <Button
            variant='ghost'
            className='pl-0 flex items-center text-muted-foreground hover:text-foreground'
            onClick={() => navigate("/view-all")}
          >
            <ChevronLeft className='h-4 w-4 mr-1' />
            Back to All Bikes
          </Button>
        </div>

        <motion.div
          className='mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className='text-3xl font-bold'>Compare Motorcycles</h1>
          <p className='text-muted-foreground mt-2'>
            Select up to {getMaxBikes()} motorcycles to compare specifications
            and features side by side
          </p>
        </motion.div>

        {/* Action buttons */}
        <div className='flex flex-wrap gap-2 mb-6'>
          <Button
            onClick={handlePrint}
            variant='outline'
            className='flex items-center gap-2'
          >
            <Printer className='h-4 w-4' />
            <span className='hidden sm:inline'>Print Comparison</span>
          </Button>

          <Button
            onClick={handleShare}
            variant='outline'
            className='flex items-center gap-2'
          >
            <Share2 className='h-4 w-4' />
            <span className='hidden sm:inline'>Share Comparison</span>
          </Button>

          {/* Only show add button if we have fewer than the max bikes for current viewport */}
          {selectedBikeIds.filter((id) => id === EMPTY_SLOT_PLACEHOLDER)
            .length === 0 &&
            selectedBikeIds.length < getMaxBikes() && (
              <Button
                onClick={addEmptySlot}
                variant='outline'
                className='flex items-center gap-2 ml-auto'
              >
                <PlusCircle className='h-4 w-4' />
                <span>Add Motorcycle</span>
              </Button>
            )}
        </div>

        {/* Comparison table */}
        <div className='grid grid-cols-1 gap-6 print:block'>
          {/* Motorcycle selection row */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:flex print:flex-row'>
            {selectedBikeIds.map(
              (bikeId, index) =>
                // Only render the number of slots appropriate for the current viewport
                index < getMaxBikes() && (
                  <div key={`${bikeId}-${index}`} className='print:w-1/4'>
                    {bikeId === EMPTY_SLOT_PLACEHOLDER ? (
                      <AddBikeCard
                        onSelect={(selectedBikeId) => {
                          const newSelectedBikeIds = [...selectedBikeIds];
                          newSelectedBikeIds[index] = selectedBikeId;
                          setSelectedBikeIds(newSelectedBikeIds);
                        }}
                        bikes={filteredBikes}
                        categoryFilter={categoryFilter}
                        setCategoryFilter={setCategoryFilter}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        categories={CATEGORIES}
                      />
                    ) : (
                      <BikeComparisonCard
                        bike={
                          allBikes.find((bike) => bike.id === bikeId) || null
                        }
                        onRemove={() => removeBike(index)}
                      />
                    )}
                  </div>
                )
            )}
          </div>

          {/* Specification comparison sections */}
          {comparisonSections.map((section) => (
            <div
              key={section.id}
              className='border rounded-lg overflow-hidden print:mb-4'
            >
              {/* Section header */}
              <div
                className='bg-gray-100 p-4 font-semibold flex justify-between items-center cursor-pointer'
                onClick={() =>
                  toggleSection(section.id as keyof typeof expandedSections)
                }
              >
                <h3>{section.title}</h3>
                <div className='md:hidden'>
                  {expandedSections[
                    section.id as keyof typeof expandedSections
                  ] ? (
                    <ChevronUp className='h-4 w-4' />
                  ) : (
                    <ChevronDown className='h-4 w-4' />
                  )}
                </div>
              </div>

              {/* Section content */}
              <div
                className={
                  expandedSections[section.id as keyof typeof expandedSections]
                    ? "block"
                    : "hidden md:block"
                }
              >
                {section.specs.map((spec) => (
                  <div key={spec.key} className='border-t'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 print:flex print:flex-row'>
                      {/* Spec label (visible only on small screens) */}
                      <div className='p-4 font-medium bg-gray-50 md:hidden'>
                        {spec.label}
                      </div>

                      {/* Spec values - Only show the number of columns for current viewport */}
                      {selectedBikes
                        .slice(0, getMaxBikes())
                        .map((bike, index) => (
                          <div
                            key={`${bike?.id || index}-${spec.key}`}
                            className={`p-4 border-t md:border-t-0 md:border-l flex items-center print:w-1/4 ${
                              viewport === "MOBILE"
                                ? "col-span-1"
                                : viewport === "TABLET"
                                ? "col-span-1 md:col-span-1"
                                : "col-span-1 md:col-span-1 lg:col-span-1"
                            }`}
                          >
                            {/* Spec label (visible only on medium and up screens) */}
                            {index === 0 && (
                              <div className='hidden md:block font-medium min-w-[120px]'>
                                {spec.label}
                              </div>
                            )}

                            {/* Spec value */}
                            <div className='flex-1 flex justify-between items-center'>
                              {bike ? (
                                <>
                                  <div className='flex-1'>
                                    {spec.type === "price" &&
                                    typeof bike[
                                      spec.key as keyof ComparisonBike
                                    ] === "number" ? (
                                      formatCurrency(
                                        bike[
                                          spec.key as keyof ComparisonBike
                                        ] as number
                                      )
                                    ) : spec.type === "cc" ? (
                                      `${
                                        bike[
                                          spec.key as keyof ComparisonBike
                                        ] || 0
                                      } cc`
                                    ) : spec.type === "hp" ? (
                                      `${
                                        bike[
                                          spec.key as keyof ComparisonBike
                                        ] || 0
                                      } HP`
                                    ) : spec.type === "kg" ? (
                                      `${
                                        bike[
                                          spec.key as keyof ComparisonBike
                                        ] || 0
                                      } kg`
                                    ) : spec.type === "features" ? (
                                      <div className='flex flex-wrap gap-1'>
                                        {(
                                          (bike[
                                            spec.key as keyof ComparisonBike
                                          ] as string[]) || []
                                        ).map((feature, idx) => (
                                          <Badge
                                            key={idx}
                                            variant='secondary'
                                            className='text-xs'
                                          >
                                            {feature}
                                          </Badge>
                                        ))}
                                      </div>
                                    ) : (
                                      String(
                                        bike[
                                          spec.key as keyof ComparisonBike
                                        ] || ""
                                      )
                                    )}
                                  </div>

                                  {/* Show indicator for numeric specs */}
                                  {["price", "cc", "hp", "kg"].includes(
                                    spec.type
                                  ) && (
                                    <div className='ml-2'>
                                      {getComparisonIndicator(
                                        bike,
                                        spec.key as keyof ComparisonBike,
                                        spec.isHigherBetter !== false
                                      )}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <span className='text-gray-400'>-</span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
