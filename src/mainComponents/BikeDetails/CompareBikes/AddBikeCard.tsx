// AddBikeCard.tsx
import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/formatters";

interface Bike {
  id: string;
  modelName: string;
  category: string;
  price: number;
  images?: string[];
  engine?: string;
  power?: number;
}

interface AddBikeCardProps {
  onSelect: (bikeId: string) => void;
  bikes: Bike[];
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: string[];
}

export function AddBikeCard({
  onSelect,
  bikes,
  categoryFilter,
  setCategoryFilter,
  searchQuery,
  setSearchQuery,
  categories,
}: AddBikeCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleBikeSelect = (bikeId: string) => {
    onSelect(bikeId);
    setIsOpen(false);
    // Reset filters after selection
    setSearchQuery("");
    setCategoryFilter("all");
  };

  const filteredBikes = bikes.filter(
    (bike) =>
      (categoryFilter === "all" || bike.category === categoryFilter) &&
      (searchQuery === "" ||
        bike.modelName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px] hover:border-gray-400 transition-colors cursor-pointer group'>
          <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors'>
            <Plus className='h-8 w-8 text-gray-400 group-hover:text-gray-600' />
          </div>
          <h3 className='text-lg font-semibold text-gray-600 mb-2'>
            Add Motorcycle
          </h3>
          <p className='text-sm text-gray-500 text-center'>
            Click to select a motorcycle for comparison
          </p>
        </div>
      </DialogTrigger>

      <DialogContent className='max-w-4xl max-h-[80vh] overflow-hidden'>
        <DialogHeader>
          <DialogTitle>Select a Motorcycle to Compare</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Filters */}
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  placeholder='Search motorcycles...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <div className='sm:w-48'>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <Filter className='h-4 w-4 mr-2' />
                  <SelectValue placeholder='Category' />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all"
                        ? "All Categories"
                        : category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results */}
          <div className='overflow-y-auto max-h-[50vh]'>
            {filteredBikes.length === 0 ? (
              <div className='text-center py-8'>
                <p className='text-gray-500'>
                  No motorcycles found matching your criteria.
                </p>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {filteredBikes.map((bike) => (
                  <div
                    key={bike.id}
                    onClick={() => handleBikeSelect(bike.id)}
                    className='border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow hover:border-red-300'
                  >
                    <div className='aspect-video bg-gray-100 rounded-md mb-3 overflow-hidden'>
                      <img
                        src={bike.images?.[0] || "/placeholder.svg"}
                        alt={bike.modelName}
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
                      />
                    </div>

                    <div className='space-y-2'>
                      <h4 className='font-semibold text-sm line-clamp-2'>
                        {bike.modelName}
                      </h4>

                      <div className='flex items-center justify-between'>
                        <Badge variant='secondary' className='text-xs'>
                          {bike.category}
                        </Badge>
                        <span className='text-sm font-medium text-red-600'>
                          {formatCurrency(bike.price)}
                        </span>
                      </div>

                      {bike.engine && (
                        <div className='text-xs text-gray-600'>
                          <span>{bike.engine}cc</span>
                          {bike.power && <span> • {bike.power}hp</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='border-t pt-4'>
            <div className='flex justify-between items-center text-sm text-gray-600'>
              <span>
                {filteredBikes.length} motorcycle
                {filteredBikes.length !== 1 ? "s" : ""} available
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
