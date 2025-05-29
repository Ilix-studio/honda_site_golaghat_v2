import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/formatters";
import { Bike } from "@/mockdata/data";
import { PlusCircle } from "lucide-react";

// Card for adding a new bike to compare
export const AddBikeCard = ({
  onSelect,
  bikes,
  categoryFilter,
  setCategoryFilter,
  searchQuery,
  setSearchQuery,
  categories,
}: {
  onSelect: (bikeId: string) => void;
  bikes: Bike[];
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: string[];
}) => {
  return (
    <Card className='h-full'>
      <CardContent className='p-4 flex flex-col items-center justify-center h-full'>
        <Popover>
          <PopoverTrigger asChild>
            <Button className='bg-red-600 hover:bg-red-700 flex items-center gap-2'>
              <PlusCircle className='h-5 w-5' />
              Select Motorcycle
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-80 p-0' align='center'>
            <div className='p-4 border-b'>
              <h4 className='font-medium'>Select a motorcycle</h4>
              <p className='text-sm text-muted-foreground mt-1'>
                Choose a motorcycle to add to your comparison
              </p>

              {/* Search input */}
              <div className='mt-2'>
                <input
                  type='text'
                  placeholder='Search motorcycles...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full p-2 border rounded-md text-sm'
                />
              </div>

              {/* Category filter */}
              <div className='mt-2 flex flex-wrap gap-1'>
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={
                      categoryFilter === category ? "default" : "outline"
                    }
                    className='cursor-pointer capitalize'
                    onClick={() => setCategoryFilter(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <ScrollArea className='h-[300px]'>
              <div className='p-2'>
                {bikes.length === 0 ? (
                  <div className='text-center py-8 text-muted-foreground'>
                    No motorcycles found
                  </div>
                ) : (
                  bikes.map((bike) => (
                    <div
                      key={bike.id}
                      className='p-2 hover:bg-gray-100 rounded-md cursor-pointer'
                      onClick={() => onSelect(bike.id)}
                    >
                      <div className='flex items-center gap-2'>
                        <div className='w-12 h-12 bg-gray-200 rounded-md overflow-hidden'>
                          <img
                            src={bike.image || "/placeholder.svg"}
                            alt={bike.name}
                            className='w-full h-full object-cover'
                          />
                        </div>
                        <div className='flex-1'>
                          <div className='font-medium text-sm'>{bike.name}</div>
                          <div className='text-xs text-muted-foreground capitalize'>
                            {bike.category} • {formatCurrency(bike.price)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>

        <div className='text-sm text-muted-foreground text-center mt-4'>
          Select a motorcycle to add to your comparison
        </div>
      </CardContent>
    </Card>
  );
};
