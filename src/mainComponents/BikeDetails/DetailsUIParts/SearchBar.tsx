import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  return (
    <div>
      <Label htmlFor='search' className='text-sm font-medium mb-2 block'>
        Search
      </Label>
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
            className='absolute right-2.5 top-2.5'
            onClick={() => setSearchQuery("")}
          >
            <X className='h-4 w-4 text-muted-foreground' />
          </button>
        )}
      </div>
    </div>
  );
}
