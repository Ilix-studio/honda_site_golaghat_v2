import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent } from "react";
import { useSearchParams } from "react-router-dom";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({
  searchQuery,
  setSearchQuery,
  placeholder = "Search bikes...",
}: SearchBarProps) {
  const [, setSearchParams] = useSearchParams();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Update URL search params when form is submitted
    if (searchQuery) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("search", searchQuery);
        return newParams;
      });
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    // Remove search param from URL
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete("search");
      return newParams;
    });
  };

  return (
    <div>
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type='button'
              className='absolute right-2.5 top-2.5'
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
