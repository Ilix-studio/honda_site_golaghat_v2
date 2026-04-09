import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Phone,
  Globe,
  Star,
  Clock,
  Navigation,
  Search,
  Loader2,
} from "lucide-react";
import {
  googlePlacesService,
  PlaceDetails,
  PlaceAutocompleteResult,
} from "@/lib/googlePlaces";

interface DealershipCardProps {
  dealership: PlaceDetails;
  onSelect: (dealership: PlaceDetails) => void;
}

const DealershipCard: React.FC<DealershipCardProps> = ({
  dealership,
  onSelect,
}) => {
  const getDirectionsUrl = () => {
    if (!dealership.geometry) return "#";
    return `https://www.google.com/maps/dir/?api=1&destination=${dealership.geometry.location.lat},${dealership.geometry.location.lng}`;
  };

  return (
    <Card
      className='hover:shadow-lg transition-shadow cursor-pointer'
      onClick={() => onSelect(dealership)}
    >
      <CardHeader className='pb-3'>
        <div className='flex justify-between items-start'>
          <div>
            <CardTitle className='text-lg'>{dealership.name}</CardTitle>
            <CardDescription className='text-sm mt-1'>
              {dealership.formatted_address}
            </CardDescription>
          </div>
          {dealership.rating && (
            <div className='flex items-center gap-1'>
              <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
              <span className='text-sm font-medium'>{dealership.rating}</span>
              <span className='text-xs text-gray-500'>
                ({dealership.user_ratings_total})
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        {dealership.opening_hours && (
          <div className='flex items-center gap-2 text-sm'>
            <Clock className='h-4 w-4 text-gray-500' />
            <span
              className={
                dealership.opening_hours.open_now
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {dealership.opening_hours.open_now ? "Open Now" : "Closed"}
            </span>
          </div>
        )}

        {dealership.formatted_phone_number && (
          <div className='flex items-center gap-2 text-sm'>
            <Phone className='h-4 w-4 text-gray-500' />
            <a
              href={`tel:${dealership.formatted_phone_number}`}
              className='text-blue-600 hover:underline'
              onClick={(e) => e.stopPropagation()}
            >
              {dealership.formatted_phone_number}
            </a>
          </div>
        )}

        {dealership.website && (
          <div className='flex items-center gap-2 text-sm'>
            <Globe className='h-4 w-4 text-gray-500' />
            <a
              href={dealership.website}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 hover:underline'
              onClick={(e) => e.stopPropagation()}
            >
              Visit Website
            </a>
          </div>
        )}

        <div className='flex gap-2 pt-2'>
          <Button
            size='sm'
            variant='outline'
            className='flex-1'
            onClick={(e) => {
              e.stopPropagation();
              window.open(getDirectionsUrl(), "_blank");
            }}
          >
            <Navigation className='h-4 w-4 mr-1' />
            Directions
          </Button>
          {dealership.reviews && dealership.reviews.length > 0 && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              <Star className='h-3 w-3' />
              {dealership.reviews.length} Reviews
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const DealershipLocator: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceAutocompleteResult[]>([]);
  const [dealerships, setDealerships] = useState<PlaceDetails[]>([]);
  const [selectedDealership, setSelectedDealership] =
    useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Could not get user location:", error);
        },
      );
    }
  }, []);

  // Search for nearby dealerships when user location is available
  useEffect(() => {
    if (userLocation && googlePlacesService.isConfigured()) {
      searchNearbyDealerships();
    }
  }, [userLocation]);

  const searchNearbyDealerships = async () => {
    if (!userLocation) return;

    setLoading(true);
    setError(null);

    try {
      const results = await googlePlacesService.searchNearbyPlaces(
        userLocation,
        25000, // 25km radius
        "car_dealer",
      );

      // Filter for Honda dealerships (this is a basic filter, you might want to enhance this)
      const hondaDealerships = results.filter(
        (dealership) =>
          dealership.name.toLowerCase().includes("honda") ||
          dealership.name.toLowerCase().includes("tsangpool"),
      );

      setDealerships(hondaDealerships.length > 0 ? hondaDealerships : results);
    } catch (err) {
      setError("Failed to fetch nearby dealerships");
      console.error("Error searching nearby dealerships:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const results = await googlePlacesService.getPlaceAutocomplete(query);
      setSuggestions(results);
    } catch (err) {
      console.error("Error getting autocomplete suggestions:", err);
    }
  };

  const handleSuggestionSelect = async (
    suggestion: PlaceAutocompleteResult,
  ) => {
    setSearchQuery(suggestion.description);
    setSuggestions([]);

    setLoading(true);
    setError(null);

    try {
      const placeDetails = await googlePlacesService.getPlaceDetails(
        suggestion.place_id,
      );
      if (placeDetails) {
        setDealerships([placeDetails]);
        setSelectedDealership(placeDetails);
      }
    } catch (err) {
      setError("Failed to fetch dealership details");
      console.error("Error fetching place details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDealershipSelect = (dealership: PlaceDetails) => {
    setSelectedDealership(dealership);
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='text-center mb-8'>
        <h1 className='text-3xl font-bold mb-4'>Find a Honda Dealership</h1>
        <p className='text-gray-600 max-w-2xl mx-auto'>
          Locate your nearest TsangPool Honda dealership for sales, service, and
          support.
        </p>
      </div>

      {/* Search Section */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Search Location</CardTitle>
          <CardDescription>
            Enter a city, address, or postal code to find dealerships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='relative'>
            <div className='flex gap-2'>
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  placeholder='Search for a location...'
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className='pl-10'
                />
              </div>
              <Button
                onClick={searchNearbyDealerships}
                disabled={!userLocation || loading}
                variant='outline'
              >
                <MapPin className='h-4 w-4 mr-2' />
                Near Me
              </Button>
            </div>

            {/* Autocomplete Suggestions */}
            {suggestions.length > 0 && (
              <div className='absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1'>
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.place_id}
                    className='px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0'
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <div className='font-medium'>
                      {suggestion.structured_formatting.main_text}
                    </div>
                    <div className='text-sm text-gray-500'>
                      {suggestion.structured_formatting.secondary_text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className='mb-8 border-red-200 bg-red-50'>
          <CardContent className='pt-6'>
            <p className='text-red-600'>{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className='flex justify-center items-center py-12'>
          <Loader2 className='h-8 w-8 animate-spin text-red-600' />
          <span className='ml-2 text-gray-600'>Finding dealerships...</span>
        </div>
      )}

      {/* Dealerships List */}
      {!loading && !error && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div>
            <h2 className='text-xl font-semibold mb-4'>
              {dealerships.length} Dealership
              {dealerships.length !== 1 ? "s" : ""} Found
            </h2>
            <div className='space-y-4'>
              {dealerships.map((dealership) => (
                <DealershipCard
                  key={dealership.place_id}
                  dealership={dealership}
                  onSelect={handleDealershipSelect}
                />
              ))}
            </div>
          </div>

          {/* Selected Dealership Details */}
          {selectedDealership && (
            <div>
              <h2 className='text-xl font-semibold mb-4'>Dealership Details</h2>
              <Card>
                <CardHeader>
                  <CardTitle>{selectedDealership.name}</CardTitle>
                  <CardDescription>
                    {selectedDealership.formatted_address}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {selectedDealership.rating && (
                    <div className='flex items-center gap-2'>
                      <Star className='h-5 w-5 fill-yellow-400 text-yellow-400' />
                      <span className='font-medium'>
                        {selectedDealership.rating}
                      </span>
                      <span className='text-gray-500'>
                        ({selectedDealership.user_ratings_total} reviews)
                      </span>
                    </div>
                  )}

                  {selectedDealership.photos &&
                    selectedDealership.photos.length > 0 && (
                      <div>
                        <h4 className='font-medium mb-2'>Photos</h4>
                        <div className='grid grid-cols-2 gap-2'>
                          {selectedDealership.photos
                            .slice(0, 4)
                            .map((photo, photoIndex) => (
                              <img
                                key={photoIndex}
                                src={googlePlacesService.getPhotoUrl(
                                  photo.photo_reference,
                                  200,
                                )}
                                alt={`${selectedDealership.name} photo ${photoIndex + 1}`}
                                className='w-full h-32 object-cover rounded-md'
                              />
                            ))}
                        </div>
                      </div>
                    )}

                  {selectedDealership.reviews &&
                    selectedDealership.reviews.length > 0 && (
                      <div>
                        <h4 className='font-medium mb-2'>Recent Reviews</h4>
                        <div className='space-y-3'>
                          {selectedDealership.reviews
                            .slice(0, 3)
                            .map((review, index) => (
                              <div
                                key={index}
                                className='border-b border-gray-100 pb-3 last:border-b-0'
                              >
                                <div className='flex items-center gap-2 mb-1'>
                                  <span className='font-medium'>
                                    {review.author_name}
                                  </span>
                                  <div className='flex items-center gap-1'>
                                    <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
                                    <span className='text-sm'>
                                      {review.rating}
                                    </span>
                                  </div>
                                  <span className='text-xs text-gray-500'>
                                    {review.relative_time_description}
                                  </span>
                                </div>
                                <p className='text-sm text-gray-600'>
                                  {review.text}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* API Configuration Warning */}
      {!googlePlacesService.isConfigured() && (
        <Card className='mt-8 border-yellow-200 bg-yellow-50'>
          <CardContent className='pt-6'>
            <p className='text-yellow-800'>
              Google Places API is not configured. Please add your API key to
              the environment variables.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DealershipLocator;
