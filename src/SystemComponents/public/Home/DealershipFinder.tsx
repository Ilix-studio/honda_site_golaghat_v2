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
import {
  MapPin,
  Navigation,
  Search,
  Loader2,
  Phone,
  Star,
  Clock,
} from "lucide-react";
import { useGooglePlaces, useUserLocation } from "@/hooks/useGooglePlaces";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const DealershipFinder: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    suggestions,
    loading: placesLoading,
    error,
    getAutocompleteSuggestions,
    searchNearbyPlaces,
    isConfigured,
  } = useGooglePlaces();

  const {
    userLocation,
    loading: locationLoading,
    getCurrentLocation,
    error: locationError,
  } = useUserLocation();

  const [nearbyDealerships, setNearbyDealerships] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Get user location on mount
  useEffect(() => {
    if (!userLocation) {
      getCurrentLocation();
    }
  }, []);

  // Search for nearby dealerships when user location is available
  useEffect(() => {
    if (userLocation && isConfigured) {
      handleNearbySearch();
    }
  }, [userLocation, isConfigured]);

  const handleNearbySearch = async () => {
    if (!userLocation) return;

    try {
      const results = await searchNearbyPlaces(
        userLocation,
        25000,
        "car_dealer",
      );
      // Filter for Honda dealerships
      const hondaDealerships = results.filter(
        (dealership) =>
          dealership.name.toLowerCase().includes("honda") ||
          dealership.name.toLowerCase().includes("tsangpool"),
      );
      setNearbyDealerships(hondaDealerships.slice(0, 3)); // Show only 3 on home page
    } catch (err) {
      console.error("Error searching nearby dealerships:", err);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      await getAutocompleteSuggestions(query);
    } catch (err) {
      console.error("Error getting suggestions:", err);
    }
  };

  const handleSuggestionSelect = async (suggestion: any) => {
    setSearchQuery(suggestion.description);
    // In a real implementation, you'd fetch the place details
    // For now, we'll just show a message
    setSearchResults([suggestion]);
  };

  const displayDealerships =
    searchResults.length > 0 ? searchResults : nearbyDealerships;

  return (
    <section className='py-16 bg-gradient-to-br from-gray-50 to-white'>
      <div className='container mx-auto px-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='text-center mb-12'
        >
          <div className='flex items-center justify-center gap-2 mb-4'>
            <div className='h-1 w-12 bg-red-500 rounded-full' />
            <span className='text-red-600 text-sm font-semibold tracking-[0.2em] uppercase'>
              Find Us
            </span>
            <div className='h-1 w-12 bg-red-500 rounded-full' />
          </div>
          <h2 className='text-3xl md:text-4xl font-bold tracking-tight mb-4'>
            Locate Your Nearest
            <span className='bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent ml-2'>
              Honda Dealership
            </span>
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Find TsangPool Honda dealerships near you for sales, service, and
            support
          </p>
        </motion.div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto'>
          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className='h-full shadow-lg border-0'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Search className='h-5 w-5 text-red-600' />
                  Find Dealerships
                </CardTitle>
                <CardDescription>
                  Search by location or use your current location
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Search Input */}
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    placeholder='Enter city, address, or postal code...'
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    className='pl-10'
                  />

                  {/* Suggestions Dropdown */}
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

                {/* Current Location Button */}
                <Button
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  variant='outline'
                  className='w-full'
                >
                  {locationLoading ? (
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  ) : (
                    <Navigation className='h-4 w-4 mr-2' />
                  )}
                  Use My Current Location
                </Button>

                {/* Error Messages */}
                {(error || locationError) && (
                  <div className='text-sm text-red-600 bg-red-50 p-3 rounded-md'>
                    {error || locationError}
                  </div>
                )}

                {/* API Configuration Warning */}
                {!isConfigured && (
                  <div className='text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md'>
                    Google Places API is not configured
                  </div>
                )}

                {/* View All Button */}
                <Link to='/dealership-locator'>
                  <Button className='w-full bg-red-600 hover:bg-red-700'>
                    View All Dealerships
                    <MapPin className='h-4 w-4 ml-2' />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className='h-full shadow-lg border-0'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <MapPin className='h-5 w-5 text-red-600' />
                  Nearby Dealerships
                </CardTitle>
                <CardDescription>
                  {displayDealerships.length > 0
                    ? "Found dealerships in your area"
                    : "Search to find dealerships"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {placesLoading ? (
                  <div className='flex justify-center items-center py-8'>
                    <Loader2 className='h-6 w-6 animate-spin text-red-600' />
                    <span className='ml-2 text-gray-600'>Searching...</span>
                  </div>
                ) : displayDealerships.length > 0 ? (
                  <div className='space-y-4'>
                    {displayDealerships.slice(0, 3).map((dealership, index) => (
                      <div
                        key={index}
                        className='border-b border-gray-100 pb-4 last:border-b-0'
                      >
                        <div className='flex justify-between items-start mb-2'>
                          <h4 className='font-semibold text-gray-900'>
                            {dealership.name}
                          </h4>
                          {dealership.rating && (
                            <div className='flex items-center gap-1'>
                              <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                              <span className='text-sm'>
                                {dealership.rating}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className='text-sm text-gray-600 mb-2'>
                          {dealership.formatted_address}
                        </p>
                        <div className='flex items-center gap-4 text-sm text-gray-500'>
                          {dealership.opening_hours?.open_now !== undefined && (
                            <div className='flex items-center gap-1'>
                              <Clock className='h-3 w-3' />
                              <span
                                className={
                                  dealership.opening_hours.open_now
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {dealership.opening_hours.open_now
                                  ? "Open"
                                  : "Closed"}
                              </span>
                            </div>
                          )}
                          {dealership.formatted_phone_number && (
                            <div className='flex items-center gap-1'>
                              <Phone className='h-3 w-3' />
                              <a
                                href={`tel:${dealership.formatted_phone_number}`}
                                className='text-blue-600 hover:underline'
                              >
                                Call
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {displayDealerships.length > 0 && (
                      <Link to='/dealership-locator'>
                        <Button variant='outline' className='w-full mt-4'>
                          View More Dealerships
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    <MapPin className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <p className='text-gray-600 mb-4'>
                      No dealerships found. Try searching for a location.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DealershipFinder;
