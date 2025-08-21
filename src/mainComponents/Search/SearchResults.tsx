import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Footer } from "../Home/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import SearchComponent from "./SearchComponent";
import { BikeCard } from "../BikeDetails/DetailsUIParts/BikeCard";
import { NoResults } from "../BikeDetails/DetailsUIParts/NoResults";
import { Bike } from "@/redux-store/slices/bikesSlice";
import { useSearchBikesQuery } from "@/redux-store/services/bikeApi";
import { Header } from "../Home/Header";

export function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  // Get initial search query from URL params
  useEffect(() => {
    const initialQuery = searchParams.get("search") || "";
    setSearchQuery(initialQuery);
  }, [searchParams]);

  // Update search query parameter
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setSearchParams({ search: query });
    } else {
      setSearchParams({});
    }
  };

  // Build search filters
  const searchFilters = {
    ...(searchQuery.trim() && { search: searchQuery.trim() }),
    limit: 50,
    page: 1,
  };

  // Use search bikes query
  const {
    data: bikesResponse,
    isLoading,
    error,
    refetch,
  } = useSearchBikesQuery(searchFilters, {
    skip: !searchQuery.trim(), // Skip the query if no search term
  });

  const searchResults: Bike[] = bikesResponse?.data || [];

  if (error) {
    return (
      <main className='min-h-screen flex flex-col'>
        <Header />
        <div className='container pt-28 pb-10 px-4 flex-grow'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold mb-4'>Search Error</h1>
            <p className='text-muted-foreground mb-4'>
              Unable to perform search. Please try again.
            </p>
            <Button onClick={() => refetch()}>Retry Search</Button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className='min-h-screen flex flex-col'>
      <Header />

      <div className='container pt-28 pb-10 px-4 flex-grow'>
        <div className='mb-8'>
          <Button
            variant='ghost'
            onClick={() => window.history.back()}
            className='pl-0 flex items-center text-muted-foreground hover:text-foreground'
          >
            <ArrowLeft className='h-4 w-4 mr-1' />
            Back
          </Button>
        </div>

        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-4'>Search Results</h1>
          <p className='text-muted-foreground mb-6'>
            {searchQuery.trim()
              ? searchResults.length > 0
                ? `Found ${searchResults.length} results for "${searchQuery}"`
                : isLoading
                ? `Searching for "${searchQuery}"...`
                : `No results found for "${searchQuery}"`
              : "Enter a search term to find motorcycles"}
          </p>

          <div className='max-w-md'>
            <SearchComponent
              onSearch={handleSearch}
              placeholder='Search again...'
            />
          </div>
        </div>

        {isLoading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='animate-spin h-8 w-8 border-4 border-red-600 rounded-full border-t-transparent'></div>
          </div>
        ) : searchResults.length > 0 ? (
          <motion.div
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {searchResults.map((bike: Bike) => (
              <BikeCard key={bike.id} bike={bike} />
            ))}
          </motion.div>
        ) : searchQuery.trim() ? (
          <NoResults resetFilters={() => setSearchParams({})} />
        ) : (
          <div className='text-center py-12 border rounded-lg'>
            <h3 className='text-lg font-medium mb-2'>Start searching</h3>
            <p className='text-muted-foreground'>
              Enter keywords to find the perfect motorcycle for you.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

export default SearchResults;
