// Updated CompareBike.tsx with improved handleBikeSelect
import { useEffect, useState } from "react";
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
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
// If you have toast notifications

import { AddBikeCard } from "./AddBikeCard";
import { BikeComparisonCard } from "./BikeComparisonCard";
import { Header } from "@/mainComponents/Header";
import { formatCurrency } from "@/lib/formatters";
import { Footer } from "@/mainComponents/Footer";
import { comparisonSections } from "./comparisonSections";
import { useGetBikesQuery } from "@/redux-store/services/bikeApi";
import { Bike } from "@/redux-store/slices/bikesSlice";

const CATEGORIES = [
  "all",
  "sport",
  "adventure",
  "cruiser",
  "touring",
  "naked",
  "electric",
];

interface ComparisonBike extends Bike {
  name: string;
  engineSize: number;
  image: string;
}

const getViewport = (): "MOBILE" | "TABLET" | "DESKTOP" => {
  const width = window.innerWidth;
  return width < 640 ? "MOBILE" : width < 1024 ? "TABLET" : "DESKTOP";
};

const getMaxBikes = (viewport: string) => {
  return viewport === "MOBILE" ? 2 : viewport === "TABLET" ? 3 : 4;
};

export default function CompareBike() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [selectedBikeIds, setSelectedBikeIds] = useState<string[]>([]);
  const [viewport, setViewport] = useState(getViewport());
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    engine: true,
    dimensions: true,
    features: true,
  });
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: bikesResponse,
    isLoading,
    error,
  } = useGetBikesQuery({ limit: 1000 });

  const allBikes: ComparisonBike[] = (bikesResponse?.data || []).map(
    (bike) => ({
      ...bike,
      name: bike.modelName,
      engineSize: parseInt(bike.engine) || 0,
      image: bike.images?.[0] || "/placeholder.svg",
    })
  );

  const maxBikes = getMaxBikes(viewport);

  // ===== ENHANCED BIKE SELECTION HANDLERS =====

  const handleBikeSelect = (bikeId: string, slotIndex: number) => {
    console.log("Selecting bike:", {
      bikeId,
      slotIndex,
      currentIds: selectedBikeIds,
      maxBikes,
    });

    // Validation
    if (!bikeId || bikeId === "add-bike") {
      toast?.({
        title: "Invalid Selection",
        description: "Please select a valid motorcycle.",
        variant: "destructive",
      });
      return false;
    }

    // Check for duplicates
    if (selectedBikeIds.includes(bikeId)) {
      toast?.({
        title: "Already Selected",
        description: "This motorcycle is already in your comparison.",
        variant: "destructive",
      });
      return false;
    }

    // Check slot index bounds
    if (slotIndex >= maxBikes) {
      toast?.({
        title: "Maximum Reached",
        description: `You can only compare up to ${maxBikes} motorcycles on this device.`,
        variant: "destructive",
      });
      return false;
    }

    setSelectedBikeIds((prev) => {
      const newIds = [...prev];

      // Handle different scenarios
      if (slotIndex >= newIds.length) {
        // Adding to new slot
        if (newIds.length < maxBikes) {
          newIds.push(bikeId);
        } else {
          toast?.({
            title: "Comparison Full",
            description: `Cannot add more than ${maxBikes} motorcycles.`,
            variant: "destructive",
          });
          return prev;
        }
      } else {
        // Replacing existing slot
        newIds[slotIndex] = bikeId;
      }

      console.log("New bike IDs:", newIds);

      // Show success message
      const selectedBike = allBikes.find((bike) => bike.id === bikeId);
      if (selectedBike) {
        toast?.({
          title: "Motorcycle Added",
          description: `${selectedBike.modelName} has been added to your comparison.`,
          variant: "",
        });
      }

      return newIds;
    });

    return true;
  };

  const handleBikeRemove = (slotIndex: number) => {
    const removedBike = allBikes.find(
      (bike) => bike.id === selectedBikeIds[slotIndex]
    );

    setSelectedBikeIds((prev) => prev.filter((_, i) => i !== slotIndex));

    if (removedBike) {
      toast?.({
        title: "Motorcycle Removed",
        description: `${removedBike.modelName} has been removed from comparison.`,
        variant: "",
      });
    }
  };

  const addBike = () => {
    if (selectedBikeIds.length < maxBikes) {
      // This will trigger the UI to show an AddBikeCard in the next available slot
      // The actual selection will be handled by handleBikeSelect
    } else {
      toast?.({
        title: "Maximum Reached",
        description: `You can only compare up to ${maxBikes} motorcycles.`,
        variant: "destructive",
      });
    }
  };

  const clearAll = () => {
    const count = selectedBikeIds.length;
    setSelectedBikeIds([]);

    if (count > 0) {
      toast?.({
        title: "Comparison Cleared",
        description: `Removed ${count} motorcycle${
          count > 1 ? "s" : ""
        } from comparison.`,
        variant: "",
      });
    }
  };

  // ===== EXISTING CODE CONTINUES =====

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("bike-comparison");
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
      "bike-comparison",
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
          const removedCount = selectedBikeIds.length - newMaxBikes;
          setSelectedBikeIds((prev) => prev.slice(0, newMaxBikes));

          toast?.({
            title: "Screen Size Changed",
            description: `Removed ${removedCount} motorcycle${
              removedCount > 1 ? "s" : ""
            } due to smaller screen size.`,
            variant: "destructive",
          });
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
      // Only set if different from current selection
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
    id === "add-bike" ? null : allBikes.find((bike) => bike.id === id) || null
  );

  const filteredBikes = allBikes.filter(
    (bike) =>
      (categoryFilter === "all" || bike.category === categoryFilter) &&
      (searchQuery === "" ||
        bike.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bike.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
      !selectedBikeIds.includes(bike.id) // Exclude already selected bikes
  );

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Rest of your comparison utilities (findBestValue, getComparisonIndicator, renderSpecValue)
  // ... [Keep all your existing comparison logic here] ...

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
              Failed to load motorcycle data. Please refresh the page.
            </AlertDescription>
          </Alert>
        </div>
        <Footer />
      </main>
    );
  }

  const canAddMore = selectedBikeIds.length < maxBikes;
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
            Back to All Bikes
          </Button>
        </div>

        <motion.div
          className='mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className='text-3xl font-bold'>Compare Motorcycles</h1>
          <p className='text-muted-foreground mt-2'>
            Select up to {maxBikes} motorcycles to compare side by side
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
                title: "Honda Motorcycles Comparison",
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

          {canAddMore && (
            <Button
              onClick={addBike}
              variant='outline'
              className='flex items-center gap-2 ml-auto'
            >
              <PlusCircle className='h-4 w-4' />
              Add Motorcycle
            </Button>
          )}

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
                              ? "grid-cols-3"
                              : "grid-cols-4"
                          }`}
                        >
                          <div className='p-4 font-medium bg-gray-50 md:hidden'>
                            {spec.label}
                          </div>

                          {selectedBikes.map((bike, index) => (
                            <div
                              key={`${bike?.id || index}-${spec.key}`}
                              className='p-4 border-t md:border-t-0 md:border-l flex items-center'
                            >
                              {index === 0 && (
                                <div className='hidden md:block font-medium min-w-[120px]'>
                                  {spec.label}
                                </div>
                              )}

                              <div className='flex-1 flex justify-between items-center'>
                                <div className='flex-1'>
                                  {renderSpecValue(bike, spec)}
                                </div>

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
                              </div>
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
        </div>
      </div>

      <Footer />
    </main>
  );

  // ===== HELPER FUNCTIONS =====

  // Comparison utilities
  function findBestValue(key: keyof ComparisonBike, isHigherBetter = true) {
    const values = selectedBikes
      .filter((bike): bike is ComparisonBike => bike !== null)
      .map((bike) =>
        typeof bike[key] === "number" ? (bike[key] as number) : 0
      );

    return values.length === 0
      ? 0
      : isHigherBetter
      ? Math.max(...values)
      : Math.min(...values);
  }

  function getComparisonIndicator(
    bike: ComparisonBike | null,
    key: keyof ComparisonBike,
    isHigherBetter = true
  ) {
    if (!bike) return null;

    const value = typeof bike[key] === "number" ? (bike[key] as number) : 0;
    const bestValue = findBestValue(key, isHigherBetter);
    const worstValue = findBestValue(key, !isHigherBetter);
    const validBikes = selectedBikes.filter((b) => b !== null).length;

    if (value === bestValue) {
      return (
        <span className='text-green-500 flex items-center' title='Best'>
          <TrendingUp className='h-4 w-4' />
        </span>
      );
    }
    if (validBikes > 1 && value === worstValue) {
      return (
        <span className='text-red-500 flex items-center' title='Lowest'>
          <TrendingDown className='h-4 w-4' />
        </span>
      );
    }
    return <Minus className='h-4 w-4 text-gray-300' />;
  }

  function renderSpecValue(bike: ComparisonBike | null, spec: any) {
    if (!bike) return <span className='text-gray-400'>-</span>;

    const value = bike[spec.key as keyof ComparisonBike];

    switch (spec.type) {
      case "price":
        return typeof value === "number" ? formatCurrency(value) : "-";
      case "cc":
      case "hp":
      case "kg":
        return `${value || 0} ${spec.type}`;
      case "features":
        return (
          <div className='flex flex-wrap gap-1'>
            {((value as string[]) || []).map((feature, idx) => (
              <Badge key={idx} variant='secondary' className='text-xs'>
                {feature}
              </Badge>
            ))}
          </div>
        );
      default:
        return String(value || "");
    }
  }
}

function toast(_arg0: { title: string; description: string; variant: string }) {
  throw new Error("Function not implemented.");
}
