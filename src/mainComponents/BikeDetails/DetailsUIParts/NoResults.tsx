import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { useAppDispatch } from "../../../hooks/redux";
import { clearFilters } from "../../../redux-store/slices/BikeSystemSlice/bikesSlice";

interface NoResultsProps {
  className?: string;
}

export function NoResults({ className }: NoResultsProps) {
  const dispatch = useAppDispatch();

  const handleResetFilters = () => {
    dispatch(clearFilters());
  };

  return (
    <div
      className={`text-center py-12 border rounded-lg bg-gray-50 dark:bg-gray-800/50 ${
        className || ""
      }`}
    >
      <div className='flex justify-center mb-4'>
        <div className='p-3 bg-gray-200 dark:bg-gray-700 rounded-full'>
          <Search className='h-6 w-6 text-gray-500 dark:text-gray-400' />
        </div>
      </div>

      <h3 className='text-lg font-medium mb-2 text-gray-900 dark:text-gray-100'>
        No bikes found
      </h3>

      <p className='text-muted-foreground mb-6 max-w-md mx-auto'>
        We couldn't find any motorcycles or scooters matching your current
        filters. Try adjusting your search criteria or browse all available
        vehicles.
      </p>

      <div className='flex flex-col sm:flex-row gap-3 justify-center'>
        <Button variant='outline' onClick={handleResetFilters}>
          <Filter className='h-4 w-4 mr-2' />
          Reset All Filters
        </Button>

        <Button asChild>
          <a href='/bikes'>Browse All Bikes</a>
        </Button>
      </div>
    </div>
  );
}
