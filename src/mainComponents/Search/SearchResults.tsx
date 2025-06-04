import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "../Header";
import { Footer } from "../Footer";

import { allBikes, Bike } from "../../mockdata/data";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import SearchComponent from "./SearchComponent";
import { BikeCard } from "../BikeDetails/DetailsUIParts/BikeCard";
import { NoResults } from "../BikeDetails/DetailsUIParts/NoResults";

export function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);

  const searchQuery = searchParams.get("search") || "";

  // Update search query parameter
  const handleSearch = (query: string) => {
    setSearchParams({ search: query });
  };

  // Filter bikes based on search query
  useEffect(() => {
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const results = allBikes.filter((bike) => {
          return (
            bike.name.toLowerCase().includes(query) ||
            bike.category.toLowerCase().includes(query) ||
            bike.features.some((feature) =>
              feature.toLowerCase().includes(query)
            )
          );
        });
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
      setLoading(false);
    }, 500);
  }, [searchQuery]);

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
            {searchResults.length > 0
              ? `Found ${searchResults.length} results for "${searchQuery}"`
              : searchQuery
              ? `No results found for "${searchQuery}"`
              : "Enter a search term to find motorcycles"}
          </p>

          <div className='max-w-md'>
            <SearchComponent
              onSearch={handleSearch}
              placeholder='Search again...'
            />
          </div>
        </div>

        {loading ? (
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
            {searchResults.map((bike) => (
              <BikeCard key={bike.id} bike={bike} />
            ))}
          </motion.div>
        ) : searchQuery ? (
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
