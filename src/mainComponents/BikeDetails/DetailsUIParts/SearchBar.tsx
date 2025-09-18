import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import {
  setFilters,
  selectBikesFilters,
} from "../../../redux-store/slices/BikeSystemSlice/bikesSlice";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  placeholder = "Search bikes by name, features...",
  className,
}: SearchBarProps) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectBikesFilters);
  const [searchParams, setSearchParams] = useSearchParams();
  const [localSearchQuery, setLocalSearchQuery] = useState(
    filters.search || ""
  );

  // Sync local state with Redux store
  useEffect(() => {
    setLocalSearchQuery(filters.search || "");
  }, [filters.search]);

  // Initialize from URL params
  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam && searchParam !== filters.search) {
      dispatch(setFilters({ search: searchParam }));
    }
  }, [searchParams, dispatch, filters.search]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Update Redux store
    dispatch(setFilters({ search: localSearchQuery || undefined }));

    // Update URL search params
    if (localSearchQuery) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("search", localSearchQuery);
        return newParams;
      });
    } else {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("search");
        return newParams;
      });
    }
  };

  const clearSearch = () => {
    setLocalSearchQuery("");
    dispatch(setFilters({ search: undefined }));

    // Remove search param from URL
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete("search");
      return newParams;
    });
  };

  return (
    <div className={className}>
      <Label htmlFor='search' className='text-sm font-medium mb-2 block'>
        Search
      </Label>
      <form onSubmit={handleSubmit}>
        <div className='relative'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            id='search'
            placeholder={placeholder}
            className='pl-9'
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
          />
          {localSearchQuery && (
            <button
              type='button'
              className='absolute right-2.5 top-2.5 hover:text-foreground transition-colors'
              onClick={clearSearch}
            >
              <X className='h-4 w-4 text-muted-foreground' />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
