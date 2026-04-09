import { useState, useCallback } from "react";
import {
  googlePlacesService,
  PlaceDetails,
  PlaceAutocompleteResult,
} from "@/lib/googlePlaces";

interface UseGooglePlacesReturn {
  placeDetails: PlaceDetails | null;
  suggestions: PlaceAutocompleteResult[];
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
  getPlaceDetails: (placeId: string) => Promise<PlaceDetails | null>;
  getAutocompleteSuggestions: (
    input: string,
  ) => Promise<PlaceAutocompleteResult[]>;
  searchNearbyPlaces: (
    location: { lat: number; lng: number },
    radius?: number,
    type?: string,
  ) => Promise<PlaceDetails[]>;
  clearError: () => void;
}

export const useGooglePlaces = (): UseGooglePlacesReturn => {
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [suggestions, setSuggestions] = useState<PlaceAutocompleteResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getPlaceDetails = useCallback(
    async (placeId: string): Promise<PlaceDetails | null> => {
      if (!googlePlacesService.isConfigured()) {
        setError("Google Places API is not configured");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const details = await googlePlacesService.getPlaceDetails(placeId);
        if (details) {
          setPlaceDetails(details);
          return details;
        } else {
          setError("Failed to fetch place details");
          return null;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getAutocompleteSuggestions = useCallback(
    async (input: string): Promise<PlaceAutocompleteResult[]> => {
      if (!googlePlacesService.isConfigured()) {
        setError("Google Places API is not configured");
        return [];
      }

      if (!input.trim()) {
        setSuggestions([]);
        return [];
      }

      setLoading(true);
      setError(null);

      try {
        const results = await googlePlacesService.getPlaceAutocomplete(input);
        setSuggestions(results);
        return results;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        setSuggestions([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const searchNearbyPlaces = useCallback(
    async (
      location: { lat: number; lng: number },
      radius: number = 5000,
      type: string = "car_dealer",
    ): Promise<PlaceDetails[]> => {
      if (!googlePlacesService.isConfigured()) {
        setError("Google Places API is not configured");
        return [];
      }

      setLoading(true);
      setError(null);

      try {
        const results = await googlePlacesService.searchNearbyPlaces(
          location,
          radius,
          type,
        );
        return results;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    placeDetails,
    suggestions,
    loading,
    error,
    isConfigured: googlePlacesService.isConfigured(),
    getPlaceDetails,
    getAutocompleteSuggestions,
    searchNearbyPlaces,
    clearError,
  };
};

// Hook for getting user's current location
export const useUserLocation = () => {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      return;
    }

    setLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (error) => {
        let errorMessage = "Failed to get your location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access was denied. Please enable location services.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }

        setLocationError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    );
  }, []);

  return {
    userLocation,
    loading,
    error: locationError,
    getCurrentLocation,
  };
};
