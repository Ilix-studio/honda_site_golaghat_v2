// Enhanced BikeComparisonCard.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/formatters";
import { Bike } from "@/redux-store/slices/bikesSlice";
import { ArrowLeftRight, X, CheckCircle, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface BikeComparisonCardProps {
  bike: Bike | null;
  onRemove: () => void;
  onReplace?: (newBikeId: string) => void;
  availableBikes?: Bike[];
  isSelected?: boolean;
  slotIndex?: number;
}

export const BikeComparisonCard = ({
  bike,
  onRemove,
  onReplace,
  availableBikes = [],
  isSelected = false,
}: BikeComparisonCardProps) => {
  const [replaceSearchQuery, setReplaceSearchQuery] = useState("");
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);

  if (!bike) return null;

  const filteredReplacementBikes = availableBikes.filter((availableBike) =>
    availableBike.modelName
      .toLowerCase()
      .includes(replaceSearchQuery.toLowerCase())
  );

  const handleReplace = (newBikeId: string) => {
    onReplace?.(newBikeId);
    setIsReplaceOpen(false);
    setReplaceSearchQuery("");
  };

  return (
    <Card
      className={`h-full transition-all duration-200 ${
        isSelected ? "ring-2 ring-red-500 shadow-lg" : ""
      }`}
    >
      <CardContent className='p-4 relative'>
        {/* Remove button */}
        <button
          onClick={onRemove}
          className='absolute top-2 right-2 p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors z-10'
          aria-label='Remove from comparison'
        >
          <X className='h-4 w-4' />
        </button>

        {/* Selection indicator */}
        {isSelected && (
          <div className='absolute top-2 left-2 p-1 rounded-full bg-green-500 text-white z-10'>
            <CheckCircle className='h-4 w-4' />
          </div>
        )}

        <div className='pt-4'>
          {/* Bike image */}
          <div className='aspect-[4/3] relative overflow-hidden mb-4'>
            <img
              src={bike.images?.[0] || "/placeholder.svg"}
              alt={bike.modelName}
              className='w-full h-full object-cover rounded-md'
              loading='lazy'
            />
            {bike.isNewModel && (
              <Badge className='absolute bottom-2 left-2 bg-red-600'>New</Badge>
            )}
          </div>

          {/* Bike details */}
          <h3 className='font-bold text-lg mb-1 line-clamp-2'>
            {bike.modelName}
          </h3>

          <div className='flex justify-between items-center mb-3'>
            <p className='text-sm text-muted-foreground capitalize'>
              {bike.category}
            </p>
            <span className='text-red-600 font-semibold'>
              {formatCurrency(bike.price)}
            </span>
          </div>

          {/* Quick specs */}
          <div className='grid grid-cols-2 gap-2 mb-3 text-xs text-muted-foreground'>
            <div>
              <span className='font-medium'>Engine:</span>
              <br />
              {bike.engine || "N/A"}
            </div>
            <div>
              <span className='font-medium'>Power:</span>
              <br />
              {bike.power ? `${bike.power} HP` : "N/A"}
            </div>
          </div>

          {/* Action buttons */}
          <div className='flex gap-2'>
            <Link to={`/bikes/${bike.id}`} className='flex-1'>
              <Button variant='outline' size='sm' className='w-full text-xs'>
                View Details
              </Button>
            </Link>

            {onReplace && availableBikes.length > 0 && (
              <Popover open={isReplaceOpen} onOpenChange={setIsReplaceOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-xs flex items-center gap-1'
                  >
                    <ArrowLeftRight className='h-3 w-3' />
                    Replace
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-80 p-0' align='center'>
                  <div className='p-4 border-b'>
                    <h4 className='font-medium'>Replace with</h4>
                    <p className='text-sm text-muted-foreground mt-1'>
                      Choose a different motorcycle
                    </p>

                    {/* Search input */}
                    <div className='mt-2 relative'>
                      <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                      <input
                        type='text'
                        placeholder='Search motorcycles...'
                        value={replaceSearchQuery}
                        onChange={(e) => setReplaceSearchQuery(e.target.value)}
                        className='w-full pl-8 pr-2 py-2 border rounded-md text-sm'
                        autoComplete='off'
                      />
                    </div>
                  </div>

                  <ScrollArea className='h-[300px]'>
                    <div className='p-2'>
                      {filteredReplacementBikes.length === 0 ? (
                        <div className='text-center py-8 text-muted-foreground'>
                          No motorcycles found
                        </div>
                      ) : (
                        filteredReplacementBikes.map((replacementBike) => (
                          <div
                            key={replacementBike.id}
                            className='p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors'
                            onClick={() => handleReplace(replacementBike.id)}
                          >
                            <div className='flex items-center gap-2'>
                              <div className='w-12 h-12 bg-gray-200 rounded-md overflow-hidden'>
                                <img
                                  src={
                                    replacementBike.images?.[0] ||
                                    "/placeholder.svg"
                                  }
                                  alt={replacementBike.modelName}
                                  className='w-full h-full object-cover'
                                  loading='lazy'
                                />
                              </div>
                              <div className='flex-1'>
                                <div className='font-medium text-sm'>
                                  {replacementBike.modelName}
                                </div>
                                <div className='text-xs text-muted-foreground capitalize'>
                                  {replacementBike.category} •{" "}
                                  {formatCurrency(replacementBike.price)}
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
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
