// hooks/useBikeComparison.ts
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import { Bike } from "@/redux-store/slices/BikeSystemSlice/bikesSlice";

interface ComparisonBike extends Bike {
  name: string;
  engineSize: number;
  image: string;
}

type Viewport = "MOBILE" | "TABLET" | "DESKTOP";

interface UseBikeComparisonOptions {
  maxBikesByViewport?: {
    MOBILE: number;
    TABLET: number;
    DESKTOP: number;
  };
  enablePersistence?: boolean;
  persistenceKey?: string;
  enableToasts?: boolean;
}

const defaultOptions: Required<UseBikeComparisonOptions> = {
  maxBikesByViewport: {
    MOBILE: 2,
    TABLET: 3,
    DESKTOP: 4,
  },
  enablePersistence: true,
  persistenceKey: "bike-comparison",
  enableToasts: true,
};

export const useBikeComparison = (
  allBikes: Bike[] = [],
  options: UseBikeComparisonOptions = {}
) => {
  const opts = { ...defaultOptions, ...options };
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State
  const [selectedBikeIds, setSelectedBikeIds] = useState<string[]>([]);
  const [viewport, setViewport] = useState<Viewport>("DESKTOP");
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    engine: true,
    dimensions: true,
    features: true,
  });

  // Helper functions
  const getViewport = useCallback((): Viewport => {
    const width = window.innerWidth;
    return width < 640 ? "MOBILE" : width < 1024 ? "TABLET" : "DESKTOP";
  }, []);

  const getMaxBikes = useCallback(
    (currentViewport: Viewport = viewport) => {
      return opts.maxBikesByViewport[currentViewport];
    },
    [viewport, opts.maxBikesByViewport]
  );

  const showToast = useCallback(
    (
      title: string,
      description: string,
      variant: "default" | "destructive" = "default"
    ) => {
      if (opts.enableToasts) {
        ({ title, description, variant });
      }
    },
    [opts.enableToasts]
  );

  // Transform bikes to comparison format
  const comparisonBikes: ComparisonBike[] = allBikes.map((bike) => ({
    ...bike,
    name: bike.modelName,
    engineSize: parseInt(bike.engine) || 0,
    image: bike.images?.[0] || "/placeholder.svg",
  }));

  // Get current selection with slots
  const maxBikes = getMaxBikes();
  const slots = Array.from(
    { length: maxBikes },
    (_, i) => selectedBikeIds[i] || "add-bike"
  );

  const selectedBikes = slots.map((id) =>
    id === "add-bike"
      ? null
      : comparisonBikes.find((bike) => bike.id === id) || null
  );

  // Core selection handlers
  const handleBikeSelect = useCallback(
    (bikeId: string, slotIndex: number): boolean => {
      console.log("Selecting bike:", {
        bikeId,
        slotIndex,
        currentIds: selectedBikeIds,
        maxBikes,
      });

      // Validation
      if (!bikeId || bikeId === "add-bike") {
        showToast(
          "Invalid Selection",
          "Please select a valid motorcycle.",
          "destructive"
        );
        return false;
      }

      // Check for duplicates
      if (selectedBikeIds.includes(bikeId)) {
        showToast(
          "Already Selected",
          "This motorcycle is already in your comparison.",
          "destructive"
        );
        return false;
      }

      // Check slot index bounds
      if (slotIndex >= maxBikes) {
        showToast(
          "Maximum Reached",
          `You can only compare up to ${maxBikes} motorcycles on this device.`,
          "destructive"
        );
        return false;
      }

      setSelectedBikeIds((prev) => {
        const newIds = [...prev];

        if (slotIndex >= newIds.length) {
          // Adding to new slot
          if (newIds.length < maxBikes) {
            newIds.push(bikeId);
          } else {
            showToast(
              "Comparison Full",
              `Cannot add more than ${maxBikes} motorcycles.`,
              "destructive"
            );
            return prev;
          }
        } else {
          // Replacing existing slot
          newIds[slotIndex] = bikeId;
        }

        // Show success message
        const selectedBike = comparisonBikes.find((bike) => bike.id === bikeId);
        if (selectedBike) {
          showToast(
            "Motorcycle Added",
            `${selectedBike.modelName} has been added to your comparison.`
          );
        }

        return newIds;
      });

      return true;
    },
    [selectedBikeIds, maxBikes, comparisonBikes, showToast]
  );

  const handleBikeRemove = useCallback(
    (slotIndex: number) => {
      const removedBike = comparisonBikes.find(
        (bike) => bike.id === selectedBikeIds[slotIndex]
      );

      setSelectedBikeIds((prev) => prev.filter((_, i) => i !== slotIndex));

      if (removedBike) {
        showToast(
          "Motorcycle Removed",
          `${removedBike.modelName} has been removed from comparison.`
        );
      }
    },
    [selectedBikeIds, comparisonBikes, showToast]
  );

  const handleBikeReplace = useCallback(
    (slotIndex: number, newBikeId: string): boolean => {
      const oldBike = comparisonBikes.find(
        (bike) => bike.id === selectedBikeIds[slotIndex]
      );
      const newBike = comparisonBikes.find((bike) => bike.id === newBikeId);

      // Check for duplicates in replacement
      if (selectedBikeIds.includes(newBikeId)) {
        showToast(
          "Already Selected",
          "This motorcycle is already in your comparison.",
          "destructive"
        );
        return false;
      }

      setSelectedBikeIds((prev) => {
        const newIds = [...prev];
        newIds[slotIndex] = newBikeId;
        return newIds;
      });

      showToast(
        "Motorcycle Replaced",
        `${oldBike?.modelName || "Previous bike"} replaced with ${
          newBike?.modelName || "new bike"
        }.`
      );

      return true;
    },
    [selectedBikeIds, comparisonBikes, showToast]
  );

  const addBike = useCallback(() => {
    if (selectedBikeIds.length < maxBikes) {
      // This will trigger the UI to show an AddBikeCard in the next available slot
      return true;
    } else {
      showToast(
        "Maximum Reached",
        `You can only compare up to ${maxBikes} motorcycles.`,
        "destructive"
      );
      return false;
    }
  }, [selectedBikeIds.length, maxBikes, showToast]);

  const clearAll = useCallback(() => {
    const count = selectedBikeIds.length;
    setSelectedBikeIds([]);

    if (count > 0) {
      showToast(
        "Comparison Cleared",
        `Removed ${count} motorcycle${count > 1 ? "s" : ""} from comparison.`
      );
    }
  }, [selectedBikeIds.length, showToast]);

  const toggleSection = useCallback(
    (section: keyof typeof expandedSections) => {
      setExpandedSections((prev) => ({
        ...prev,
        [section]: !prev[section],
      }));
    },
    []
  );

  // Comparison utilities
  const findBestValue = useCallback(
    (key: keyof ComparisonBike, isHigherBetter = true): number => {
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
    },
    [selectedBikes]
  );

  const getComparisonIndicator = useCallback(
    (
      bike: ComparisonBike | null,
      key: keyof ComparisonBike,
      isHigherBetter = true
    ) => {
      if (!bike) return null;

      const value = typeof bike[key] === "number" ? (bike[key] as number) : 0;
      const bestValue = findBestValue(key, isHigherBetter);
      const worstValue = findBestValue(key, !isHigherBetter);
      const validBikes = selectedBikes.filter((b) => b !== null).length;

      if (value === bestValue) return "best";
      if (validBikes > 1 && value === worstValue) return "worst";
      return "neutral";
    },
    [selectedBikes, findBestValue]
  );

  // Effects

  // Load from localStorage on mount
  useEffect(() => {
    if (!opts.enablePersistence) return;

    const saved = localStorage.getItem(opts.persistenceKey);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.selectedBikeIds) {
          setSelectedBikeIds(data.selectedBikeIds);
        }
        if (data.expandedSections) {
          setExpandedSections(data.expandedSections);
        }
      } catch (e) {
        console.error("Failed to parse saved comparison data:", e);
      }
    }
  }, [opts.enablePersistence, opts.persistenceKey]);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!opts.enablePersistence) return;

    localStorage.setItem(
      opts.persistenceKey,
      JSON.stringify({
        selectedBikeIds,
        expandedSections,
      })
    );
  }, [
    selectedBikeIds,
    expandedSections,
    opts.enablePersistence,
    opts.persistenceKey,
  ]);

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

          showToast(
            "Screen Size Changed",
            `Removed ${removedCount} motorcycle${
              removedCount > 1 ? "s" : ""
            } due to smaller screen size.`,
            "destructive"
          );
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [viewport, selectedBikeIds, getViewport, getMaxBikes, showToast]);

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

  // Computed values
  const canAddMore = selectedBikeIds.length < maxBikes;
  const isEmpty = selectedBikeIds.length === 0;
  const hasSelection = selectedBikes.some((bike) => bike !== null);

  return {
    // State
    selectedBikeIds,
    selectedBikes,
    slots,
    viewport,
    expandedSections,
    maxBikes,

    // Actions
    handleBikeSelect,
    handleBikeRemove,
    handleBikeReplace,
    addBike,
    clearAll,
    toggleSection,

    // Utilities
    findBestValue,
    getComparisonIndicator,

    // Computed
    canAddMore,
    isEmpty,
    hasSelection,
    comparisonBikes,
  };
};
