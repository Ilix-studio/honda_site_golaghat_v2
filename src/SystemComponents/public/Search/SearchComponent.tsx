import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SearchComponentProps {
  placeholder?: string;
  darkMode?: boolean;
  className?: string;
  onSearch?: (query: string) => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  placeholder = "Search motorcycles",
  darkMode = false,
  className = "",
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      if (onSearch) {
        // If an onSearch callback is provided, use it
        onSearch(searchQuery);
      } else {
        // Otherwise navigate to search results page
        navigate(`/view-all?search=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  // Define styles based on dark mode
  const inputStyles = darkMode
    ? "border-2 border-gray-700 bg-transparent text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50"
    : "border border-gray-300 bg-white text-black placeholder-gray-500 focus:ring-2 focus:ring-red-600/50";

  const buttonStyles = darkMode
    ? "bg-white text-black hover:bg-gray-200"
    : "bg-red-600 text-white hover:bg-red-700";

  return (
    <form onSubmit={handleSearch} className={`flex w-full ${className}`}>
      <div className='relative flex-1'>
        <Input
          type='text'
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-4 pr-10 py-2 rounded-lg h-11 ${inputStyles}`}
        />
        <Button
          type='submit'
          variant='outline'
          className={`absolute right-0 top-0 h-full rounded-none rounded-r-md px-3 ${buttonStyles}`}
        >
          <Search className='h-5 w-5' />
        </Button>
      </div>
    </form>
  );
};

export default SearchComponent;
