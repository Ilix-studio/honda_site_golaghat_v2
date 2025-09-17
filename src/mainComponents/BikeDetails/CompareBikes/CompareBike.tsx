import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Printer,
  Share2,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { BikeComparisonCard } from "./BikeComparisonCard";

import { formatCurrency } from "@/lib/formatters";
import { Footer } from "@/mainComponents/Home/Footer";
import { comparisonSections } from "./comparisonSections";
import { useGetBikesQuery } from "@/redux-store/services/BikeSystemApi/bikeApi";
import { Bike } from "@/redux-store/slices/BikeSystemSlice/bikesSlice";
import { AddBikeCard } from "./AddBikeCard";
import { Header } from "@/mainComponents/Home/Header/Header";

const CATEGORIES = [
  "all",
  "sport",
  "adventure",
  "cruiser",
  "touring",
  "naked",
  "electric",
  "commuter",
  "automatic",
  "gearless",
];

const getViewport = (): "MOBILE" | "TABLET" | "DESKTOP" => {
  const width = window.innerWidth;
  return width < 640 ? "MOBILE" : width < 1024 ? "TABLET" : "DESKTOP";
};

const getMaxBikes = (viewport: string) => {
  return viewport === "MOBILE" ? 2 : viewport === "TABLET" ? 3 : 4;
};

// Helper function to get nested object value by string path
const getNestedValue = (obj: any, path: string): any => {
  return path.split(".").reduce((curr, key) => curr?.[key], obj);
};

export default function CompareBike() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [selectedBikeIds, setSelectedBikeIds] = useState<string[]>([]);
  const [viewport, setViewport] = useState(getViewport());
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    engine: true,
    pricing: true,
    variants: true,
    features: true,
    availability: true,
  });
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch bikes data
  const {
    data: bikesResponse,
    isLoading,
    error,
  } = useGetBikesQuery({ limit: 1000 });

  const allBikes: Bike[] = bikesResponse?.data?.bikes || [];
  const maxBikes = getMaxBikes(viewport);

  // Enhanced handleBikeSelect function
  const handleBikeSelect = (bikeId: string, slotIndex: number): boolean => {
    if (!bikeId || bikeId === "add-bike") {
      return false;
    }

    if (selectedBikeIds.includes(bikeId)) {
      return false;
    }

    if (slotIndex >= maxBikes) {
      return false;
    }

    setSelectedBikeIds((prev) => {
      const newIds = [...prev];

      if (slotIndex >= newIds.length) {
        if (newIds.length < maxBikes) {
          newIds.push(bikeId);
        } else {
          return prev;
        }
      } else {
        newIds[slotIndex] = bikeId;
      }

      return newIds;
    });

    return true;
  };

  const handleBikeRemove = (slotIndex: number) => {
    setSelectedBikeIds((prev) => prev.filter((_, i) => i !== slotIndex));
  };

  const clearAll = () => {
    setSelectedBikeIds([]);
  };

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("honda-bike-comparison");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setSelectedBikeIds(data.selectedBikeIds || []);
        setExpandedSections(data.expandedSections || expandedSections);
      } catch (e) {
        console.error("Failed to parse saved comparison data:", e);
      }
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem(
      "honda-bike-comparison",
      JSON.stringify({
        selectedBikeIds,
        expandedSections,
      })
    );
  }, [selectedBikeIds, expandedSections]);

  // Handle viewport changes
  useEffect(() => {
    const handleResize = () => {
      const newViewport = getViewport();
      if (newViewport !== viewport) {
        setViewport(newViewport);
        const newMaxBikes = getMaxBikes(newViewport);
        if (selectedBikeIds.length > newMaxBikes) {
          setSelectedBikeIds((prev) => prev.slice(0, newMaxBikes));
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [viewport, selectedBikeIds]);

  // Initialize from URL
  useEffect(() => {
    const bikeIds = searchParams.getAll("bikes");
    if (bikeIds.length > 0) {
      const validIds = bikeIds.slice(0, maxBikes);
      if (JSON.stringify(validIds) !== JSON.stringify(selectedBikeIds)) {
        setSelectedBikeIds(validIds);
      }
    }
  }, [searchParams, maxBikes]);

  // Update URL when selection changes
  useEffect(() => {
    const validIds = selectedBikeIds.filter((id) => id && id !== "add-bike");
    if (validIds.length > 0) {
      setSearchParams({ bikes: validIds });
    } else {
      navigate("/compare", { replace: true });
    }
  }, [selectedBikeIds, setSearchParams, navigate]);

  // Get slots with placeholders
  const slots = Array.from(
    { length: maxBikes },
    (_, i) => selectedBikeIds[i] || "add-bike"
  );

  const selectedBikes = slots.map((id) =>
    id === "add-bike" ? null : allBikes.find((bike) => bike._id === id) || null
  );

  const filteredBikes = allBikes.filter(
    (bike) =>
      (categoryFilter === "all" || bike.category === categoryFilter) &&
      (searchQuery === "" ||
        bike.modelName.toLowerCase().includes(searchQuery.toLowerCase())) &&
      !selectedBikeIds.includes(bike._id)
  );

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Comparison utilities
  const findBestValue = (key: string, isHigherBetter = true) => {
    const values = selectedBikes
      .filter((bike): bike is Bike => bike !== null)
      .map((bike) => {
        const value = getNestedValue(bike, key);
        return typeof value === "number" ? value : 0;
      });

    return values.length === 0
      ? 0
      : isHigherBetter
      ? Math.max(...values)
      : Math.min(...values);
  };

  const getComparisonIndicator = (
    bike: Bike | null,
    key: string,
    isHigherBetter = true
  ) => {
    if (!bike) return null;

    const value = getNestedValue(bike, key);
    const numValue = typeof value === "number" ? value : 0;
    const bestValue = findBestValue(key, isHigherBetter);
    const worstValue = findBestValue(key, !isHigherBetter);
    const validBikes = selectedBikes.filter((b) => b !== null).length;

    if (numValue === bestValue && numValue > 0) {
      return (
        <span className='text-green-500 flex items-center' title='Best'>
          <TrendingUp className='h-4 w-4' />
        </span>
      );
    }
    if (validBikes > 1 && numValue === worstValue && numValue > 0) {
      return (
        <span className='text-red-500 flex items-center' title='Lowest'>
          <TrendingDown className='h-4 w-4' />
        </span>
      );
    }
    return <Minus className='h-4 w-4 text-gray-300' />;
  };

  const renderSpecValue = (bike: Bike | null, spec: any) => {
    if (!bike) return <span className='text-gray-400'>-</span>;

    const value = getNestedValue(bike, spec.key);

    switch (spec.type) {
      case "price":
        return typeof value === "number" ? formatCurrency(value) : "-";
      case "cc":
      case "hp":
      case "kg":
        return `${value || 0} ${spec.type}`;
      case "boolean":
        return (
          <Badge variant={value ? "default" : "secondary"} className='text-xs'>
            {value ? "Yes" : "No"}
          </Badge>
        );
      case "features":
        return (
          <div className='flex flex-wrap gap-1'>
            {((value as string[]) || []).slice(0, 3).map((feature, idx) => (
              <Badge key={idx} variant='secondary' className='text-xs'>
                {feature}
              </Badge>
            ))}
            {((value as string[]) || []).length > 3 && (
              <Badge variant='outline' className='text-xs'>
                +{((value as string[]) || []).length - 3} more
              </Badge>
            )}
          </div>
        );
      case "number":
        return String(value || 0);
      default:
        return String(value || "");
    }
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
        <div className='flex-grow flex items-center justify-center p-4'>
          <Alert variant='destructive' className='max-w-md'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              Failed to load Honda vehicle data. Please refresh the page.
            </AlertDescription>
          </Alert>
        </div>
        <Footer />
      </main>
    );
  }

  const isEmpty = selectedBikeIds.length === 0;

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
            Back to All Vehicles
          </Button>
        </div>

        <motion.div
          className='mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className='text-3xl font-bold'>Compare Honda Vehicles</h1>
          <p className='text-muted-foreground mt-2'>
            Select up to {maxBikes} Honda motorcycles or scooters to compare
            side by side
          </p>
        </motion.div>

        <div className='flex flex-wrap gap-2 mb-6'>
          <Button
            onClick={() => window.print()}
            variant='outline'
            disabled={isEmpty}
            className='flex items-center gap-2'
          >
            <Printer className='h-4 w-4' />
            Print
          </Button>

          <Button
            onClick={() =>
              navigator.share?.({
                title: "Honda Vehicles Comparison - Tsangpool Honda",
                url: window.location.href,
              }) || navigator.clipboard.writeText(window.location.href)
            }
            variant='outline'
            disabled={isEmpty}
            className='flex items-center gap-2'
          >
            <Share2 className='h-4 w-4' />
            Share
          </Button>

          {!isEmpty && (
            <Button
              onClick={clearAll}
              variant='outline'
              className='text-red-600 hover:text-red-700'
            >
              Clear All
            </Button>
          )}
        </div>

        <div className='grid grid-cols-1 gap-6'>
          {/* Selection Row */}
          <div
            className={`grid gap-4 ${
              viewport === "MOBILE"
                ? "grid-cols-1"
                : viewport === "TABLET"
                ? "grid-cols-3"
                : "grid-cols-4"
            }`}
          >
            {slots.map((bikeId, index) => (
              <div key={index}>
                {bikeId === "add-bike" ? (
                  <AddBikeCard
                    onSelect={(id) => handleBikeSelect(id, index)}
                    bikes={filteredBikes}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    categories={CATEGORIES}
                  />
                ) : (
                  <BikeComparisonCard
                    bike={selectedBikes[index]}
                    onRemove={() => handleBikeRemove(index)}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Specifications Comparison */}
          {selectedBikes.some((bike) => bike !== null) && (
            <>
              {comparisonSections.map((section) => (
                <div
                  key={section.id}
                  className='border rounded-lg overflow-hidden'
                >
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

                  <div
                    className={
                      expandedSections[
                        section.id as keyof typeof expandedSections
                      ]
                        ? "block"
                        : "hidden md:block"
                    }
                  >
                    {section.specs.map((spec) => (
                      <div key={spec.key} className='border-t'>
                        <div
                          className={`grid ${
                            viewport === "MOBILE"
                              ? "grid-cols-1"
                              : viewport === "TABLET"
                              ? "grid-cols-4"
                              : "grid-cols-5"
                          }`}
                        >
                          {/* Mobile header */}
                          <div className='p-4 font-medium bg-gray-50 md:hidden'>
                            {spec.label}
                          </div>

                          {/* Desktop label column */}
                          <div className='hidden md:block p-4 font-medium bg-gray-50 border-r'>
                            {spec.label}
                          </div>

                          {selectedBikes.map((bike, index) => (
                            <div
                              key={`${bike?._id || index}-${spec.key}`}
                              className='p-4 border-t md:border-t-0 md:border-l flex items-center justify-between'
                            >
                              <div className='flex-1'>
                                {renderSpecValue(bike, spec)}
                              </div>

                              {["price", "cc", "hp", "kg", "number"].includes(
                                spec.type
                              ) && (
                                <div className='ml-2'>
                                  {getComparisonIndicator(
                                    bike,
                                    spec.key,
                                    spec.isHigherBetter !== false
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Empty state */}
          {selectedBikes.every((bike) => bike === null) && (
            <motion.div
              className='text-center py-16'
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className='bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6'>
                <AlertCircle className='h-12 w-12 text-gray-400' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>
                No Vehicles Selected
              </h3>
              <p className='text-muted-foreground mb-6'>
                Select Honda motorcycles or scooters from the cards above to
                start comparing their specifications, features, and pricing.
              </p>
              <Button
                onClick={() => navigate("/view-all")}
                className='bg-red-600 hover:bg-red-700 text-white'
              >
                Browse All Vehicles
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
