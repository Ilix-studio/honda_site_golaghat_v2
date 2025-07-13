import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";
import { Bike } from "@/redux-store/slices/bikesSlice";
import { X, Eye, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface BikeComparisonCardProps {
  bike: Bike | null;
  onRemove: () => void;
  isSelected?: boolean;
  slotIndex?: number;
}

export const BikeComparisonCard = ({
  bike,
  onRemove,
  isSelected = false,
}: BikeComparisonCardProps) => {
  if (!bike) return null;

  // Use either id or _id depending on what's available
  const bikeId = bike.id || bike._id;

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
          className='absolute top-2 right-2 p-1 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors z-10'
          aria-label='Remove from comparison'
        >
          <X className='h-4 w-4 text-gray-600' />
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
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
            {bike.isNewModel && (
              <Badge className='absolute bottom-2 left-2 bg-red-600'>New</Badge>
            )}

            {/* Stock status indicator */}
            <div className='absolute top-2 right-2'>
              <div
                className={`w-3 h-3 rounded-full ${
                  bike.inStock ? "bg-green-500" : "bg-red-500"
                }`}
                title={bike.inStock ? "In Stock" : "Out of Stock"}
              />
            </div>
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
          <div className='grid grid-cols-2 gap-2 mb-4 text-xs text-muted-foreground'>
            <div>
              <span className='font-medium'>Engine:</span>
              <br />
              <span className='text-gray-900'>{bike.engine || "N/A"}</span>
            </div>
            <div>
              <span className='font-medium'>Power:</span>
              <br />
              <span className='text-gray-900'>
                {bike.power ? `${bike.power} HP` : "N/A"}
              </span>
            </div>
            <div>
              <span className='font-medium'>Weight:</span>
              <br />
              <span className='text-gray-900'>
                {bike.weight ? `${bike.weight} kg` : "N/A"}
              </span>
            </div>
            <div>
              <span className='font-medium'>Stock:</span>
              <br />
              <span
                className={bike.inStock ? "text-green-600" : "text-red-600"}
              >
                {bike.inStock ? "Available" : "Out of Stock"}
              </span>
            </div>
          </div>

          {/* Features preview */}
          {bike.features && bike.features.length > 0 && (
            <div className='mb-3'>
              <p className='text-xs font-medium text-muted-foreground mb-1'>
                Key Features:
              </p>
              <div className='flex flex-wrap gap-1'>
                {bike.features.slice(0, 3).map((feature, idx) => (
                  <Badge key={idx} variant='outline' className='text-xs'>
                    {feature}
                  </Badge>
                ))}
                {bike.features.length > 3 && (
                  <Badge variant='outline' className='text-xs'>
                    +{bike.features.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className='flex gap-2'>
            <Link to={`/bikes/${bikeId}`} className='flex-1'>
              <Button
                variant='outline'
                size='sm'
                className='w-full text-xs flex items-center gap-1'
              >
                <Eye className='h-3 w-3' />
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
