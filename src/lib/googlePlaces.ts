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
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('Google Places API key is not configured. Please set VITE_GOOGLE_PLACES_API_KEY in your environment variables.');
    }
  }

  /**
   * Get place details using place ID
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      if (!this.apiKey) {
        throw new Error('Google Places API key is not configured');
      }

      const response = await fetch(
        `${this.baseUrl}/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,reviews,geometry,opening_hours,photos&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }

      return data.result;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  }

  /**
   * Get place suggestions using autocomplete
   */
  async getPlaceAutocomplete(input: string): Promise<PlaceAutocompleteResult[]> {
    try {
      if (!this.apiKey) {
        throw new Error('Google Places API key is not configured');
      }

      const response = await fetch(
        `${this.baseUrl}/place/autocomplete/json?input=${encodeURIComponent(input)}&types=establishment&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }

      return data.predictions;
    } catch (error) {
      console.error('Error fetching place autocomplete:', error);
      return [];
    }
  }

  /**
   * Search for nearby places
   */
  async searchNearbyPlaces(
    location: { lat: number; lng: number },
    radius: number = 5000,
    type: string = 'car_dealer'
  ): Promise<PlaceDetails[]> {
    try {
      if (!this.apiKey) {
        throw new Error('Google Places API key is not configured');
      }

      const response = await fetch(
        `${this.baseUrl}/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&type=${type}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }

      return data.results;
    } catch (error) {
      console.error('Error searching nearby places:', error);
      return [];
    }
  }

  /**
   * Get photo URL from photo reference
   */
  getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    if (!this.apiKey) {
      return '';
    }
    return `${this.baseUrl}/place/photo?maxwidth=${maxWidth}&photo_reference=${encodeURIComponent(photoReference)}&key=${this.apiKey}`;
  }

  /**
   * Check if API is properly configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

// Export singleton instance
export const googlePlacesService = new GooglePlacesService();

// Export types for use in components
export type { GooglePlacesService };
