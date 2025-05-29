import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { Bike } from "@/mockdata/data";
import { ArrowLeftRight, Badge, Link, X } from "lucide-react";

// Card for displaying a bike in the comparison
export const BikeComparisonCard = ({
  bike,
  onRemove,
}: {
  bike: Bike | null;
  onRemove: () => void;
}) => {
  if (!bike) return null;

  return (
    <Card className='h-full'>
      <CardContent className='p-4 relative'>
        <button
          onClick={onRemove}
          className='absolute top-2 right-2 p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors'
          aria-label='Remove from comparison'
        >
          <X className='h-4 w-4' />
        </button>

        <div className='pt-4'>
          <div className='aspect-[4/3] relative overflow-hidden mb-4'>
            <img
              src={bike.image || "/placeholder.svg"}
              alt={bike.name}
              className='w-full h-full object-cover rounded-md'
            />
            {bike.isNew && (
              <Badge className='absolute top-2 left-2 bg-red-600'>New</Badge>
            )}
          </div>

          <h3 className='font-bold text-lg mb-1'>{bike.name}</h3>

          <div className='flex justify-between items-center mb-3'>
            <p className='text-sm text-muted-foreground capitalize'>
              {bike.category}
            </p>
            <span className='text-red-600 font-semibold'>
              {formatCurrency(bike.price)}
            </span>
          </div>

          <div className='flex justify-between'>
            <Link to={`/bikes/${bike.id}`}>
              <Button variant='outline' size='sm' className='text-xs'>
                View Details
              </Button>
            </Link>

            <Button
              variant='ghost'
              size='sm'
              className='text-xs flex items-center gap-1'
              onClick={onRemove}
            >
              <ArrowLeftRight className='h-3 w-3' />
              Change
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
