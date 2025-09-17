import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";
import { Bike } from "@/redux-store/slices/BikeSystemSlice/bikesSlice";
import { X, Eye, CheckCircle, Fuel, Zap } from "lucide-react";
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

  const bikeId = bike._id;
  const primaryImage =
    bike.images?.find((img) => img.isPrimary) || bike.images?.[0];
  const onRoadPrice =
    bike.priceBreakdown?.onRoadPrice ||
    bike.priceBreakdown?.exShowroomPrice ||
    0;

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
          {/* Vehicle image */}
          <div className='aspect-[4/3] relative overflow-hidden mb-4'>
            <img
              src={primaryImage?.src || "/api/placeholder/400/300"}
              alt={bike.modelName}
              className='w-full h-full object-cover rounded-md'
              loading='lazy'
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/api/placeholder/400/300";
              }}
            />

            {/* Badges */}
            <div className='absolute bottom-2 left-2 flex gap-1'>
              {bike.isNewModel && (
                <Badge className='bg-red-600 text-white text-xs'>New</Badge>
              )}
              {bike.isE20Efficiency && (
                <Badge className='bg-green-600 text-white text-xs'>E20</Badge>
              )}
            </div>

            {/* Stock status indicator */}
            <div className='absolute top-2 right-8'>
              <div
                className={`w-3 h-3 rounded-full ${
                  bike.stockAvailable > 0 ? "bg-green-500" : "bg-red-500"
                }`}
                title={bike.stockAvailable > 0 ? "In Stock" : "Out of Stock"}
              />
            </div>
          </div>

          {/* Vehicle details */}
          <h3 className='font-bold text-lg mb-1 line-clamp-2'>
            {bike.modelName}
          </h3>

          <div className='flex justify-between items-center mb-3'>
            <div className='flex flex-col gap-1'>
              <Badge variant='outline' className='text-xs w-fit'>
                {bike.mainCategory}
              </Badge>
              <p className='text-xs text-muted-foreground capitalize'>
                {bike.category} • {bike.year}
              </p>
            </div>
            <div className='text-right'>
              <span className='text-red-600 font-semibold text-sm'>
                {formatCurrency(onRoadPrice)}
              </span>
              <p className='text-xs text-muted-foreground'>On-Road</p>
            </div>
          </div>

          {/* Quick specs */}
          <div className='grid grid-cols-2 gap-2 mb-4 text-xs'>
            <div className='flex items-center gap-1'>
              <Zap className='h-3 w-3 text-blue-500' />
              <div>
                <span className='text-muted-foreground'>Engine:</span>
                <div className='font-medium text-gray-900'>
                  {bike.engineSize || "N/A"}
                </div>
              </div>
            </div>
            <div className='flex items-center gap-1'>
              <div className='h-3 w-3 rounded-full bg-orange-500' />
              <div>
                <span className='text-muted-foreground'>Power:</span>
                <div className='font-medium text-gray-900'>
                  {bike.power ? `${bike.power} HP` : "N/A"}
                </div>
              </div>
            </div>
            <div className='flex items-center gap-1'>
              <Fuel className='h-3 w-3 text-green-500' />
              <div>
                <span className='text-muted-foreground'>Fuel:</span>
                <div className='font-medium text-gray-900'>
                  {bike.fuelNorms}
                </div>
              </div>
            </div>
            <div className='flex items-center gap-1'>
              <div className='h-3 w-3 rounded-full bg-purple-500' />
              <div>
                <span className='text-muted-foreground'>Stock:</span>
                <div
                  className={`font-medium ${
                    bike.stockAvailable > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {bike.stockAvailable > 0 ? `${bike.stockAvailable}` : "0"}
                </div>
              </div>
            </div>
          </div>

          {/* Features preview */}
          {bike.features && bike.features.length > 0 && (
            <div className='mb-3'>
              <p className='text-xs font-medium text-muted-foreground mb-1'>
                Key Features:
              </p>
              <div className='flex flex-wrap gap-1'>
                {bike.features.slice(0, 2).map((feature, idx) => (
                  <Badge key={idx} variant='outline' className='text-xs'>
                    {feature}
                  </Badge>
                ))}
                {bike.features.length > 2 && (
                  <Badge variant='outline' className='text-xs'>
                    +{bike.features.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Variants info */}
          {bike.variants && bike.variants.length > 1 && (
            <div className='mb-3'>
              <p className='text-xs text-muted-foreground'>
                {bike.variants.length} variants available
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className='flex gap-2'>
            <Link to={`/${bike.mainCategory}s/${bikeId}`} className='flex-1'>
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
