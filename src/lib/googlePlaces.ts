// Google Places API Service
// This file handles all Google Places API interactions

// Types for Google Places API responses
export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  reviews?: PlaceReview[];
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  photos?: PlacePhoto[];
}

export interface PlaceReview {
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

export interface PlacePhoto {
  photo_reference: string;
  width: number;
  height: number;
}

export interface PlaceAutocompleteResult {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

class GooglePlacesService {
  private baseUrl = "/api/google-places";

  constructor() {
    // API key is now handled on the backend
    console.log("Google Places Service initialized with backend proxy");
  }

  /**
   * Get place details using place ID
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/place-details?place_id=${encodeURIComponent(placeId)}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,reviews,geometry,opening_hours,photos`,
      );

      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
        } else {
          const text = await response.text();
          console.error("Non-JSON error response from Google Places API:", text.substring(0, 200));
          throw new Error(`Server returned an unexpected response (status: ${response.status}). This may be due to a configuration issue.`);
        }
      }

      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Expected JSON but received:", text.substring(0, 200));
        throw new Error("Invalid response format from server. Please check your backend configuration.");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Unknown error");
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching place details:", error);
      throw error; // Rethrow to let the component handle it
    }
  }

  /**
   * Get place suggestions using autocomplete
   */
  async getPlaceAutocomplete(
    input: string,
  ): Promise<PlaceAutocompleteResult[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/autocomplete?input=${encodeURIComponent(input)}&types=establishment`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Unknown error");
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching place autocomplete:", error);
      return [];
    }
  }

  /**
   * Search for nearby places
   */
  async searchNearbyPlaces(
    location: { lat: number; lng: number },
    radius: number = 5000,
    type: string = "car_dealer",
  ): Promise<PlaceDetails[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/nearbysearch?location=${location.lat},${location.lng}&radius=${radius}&type=${type}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Unknown error");
      }

      return data.data;
    } catch (error) {
      console.error("Error searching nearby places:", error);
      return [];
    }
  }

  /**
   * Get photo URL from photo reference
   */
  getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    return `${this.baseUrl}/photo?photoreference=${encodeURIComponent(photoReference)}&maxwidth=${maxWidth}`;
  }

  /**
   * Check if API is properly configured
   */
  isConfigured(): boolean {
    // Always return true when using backend proxy
    return true;
  }
}

// Export singleton instance
export const googlePlacesService = new GooglePlacesService();

// Export types for use in components
export type { GooglePlacesService };
