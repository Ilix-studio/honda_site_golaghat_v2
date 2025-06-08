import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "../../../lib/formatters";
import { Link } from "react-router-dom";
import { Bike } from "../../../redux-store/slices/bikesSlice";

interface BikeCardProps {
  bike: Bike;
}

export function BikeCard({ bike }: BikeCardProps) {
  // Extract engine size from engine string (e.g., "162.71 cc")
  const getEngineSize = (engineString: string): string => {
    const match = engineString.match(/(\d+(?:\.\d+)?)/);
    return match ? `${match[1]}cc` : engineString;
  };

  // Get the first image or use placeholder
  const getImageUrl = (): string => {
    if (bike.images && bike.images.length > 0) {
      return bike.images[0];
    }
    return "/placeholder.svg";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className='h-full'
    >
      <Card className='overflow-hidden h-full flex flex-col'>
        <div className='relative'>
          <Link to={`/bikes/${bike.id}`}>
            <div className='aspect-[4/3] relative overflow-hidden'>
              <img
                src={getImageUrl()}
                alt={bike.modelName}
                className='object-cover transition-transform duration-300 hover:scale-105 w-full h-full'
              />
            </div>
          </Link>
          {bike.isNew && (
            <Badge className='absolute top-2 right-2 bg-red-600'>New</Badge>
          )}
          {!bike.inStock && (
            <Badge className='absolute top-2 left-2 bg-gray-600'>
              Out of Stock
            </Badge>
          )}
        </div>

        <CardContent className='p-4 flex flex-col flex-grow'>
          <div className='mb-2'>
            <div className='flex justify-between items-start'>
              <h3 className='font-bold text-lg'>{bike.modelName}</h3>
              <span className='text-red-600 font-semibold'>
                {formatCurrency(bike.price)}
              </span>
            </div>
            <p className='text-sm text-muted-foreground capitalize'>
              {bike.category}
            </p>
          </div>

          <div className='grid grid-cols-2 gap-2 text-sm mb-4'>
            <div className='flex flex-col'>
              <span className='text-muted-foreground'>Engine</span>
              <span>{getEngineSize(bike.engine)}</span>
            </div>
            <div className='flex flex-col'>
              <span className='text-muted-foreground'>Power</span>
              <span>{bike.power} HP</span>
            </div>
            <div className='flex flex-col'>
              <span className='text-muted-foreground'>Transmission</span>
              <span>{bike.transmission}</span>
            </div>
            <div className='flex flex-col'>
              <span className='text-muted-foreground'>Year</span>
              <span>{bike.year}</span>
            </div>
          </div>

          {bike.features && bike.features.length > 0 && (
            <div className='flex flex-wrap gap-1 mb-4'>
              {bike.features.slice(0, 3).map((feature) => (
                <Badge key={feature} variant='secondary' className='text-xs'>
                  {feature}
                </Badge>
              ))}
              {bike.features.length > 3 && (
                <Badge variant='outline' className='text-xs'>
                  +{bike.features.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <div className='mt-auto flex gap-2'>
            <Link to={`/bikes/${bike.id}`} className='flex-1'>
              <Button
                className='w-full bg-red-600 hover:bg-red-700'
                disabled={!bike.inStock}
              >
                {bike.inStock ? "Details" : "Out of Stock"}
              </Button>
            </Link>
            <Link to={`/compare?bikes=${bike.id}`} className='flex-1'>
              <Button variant='outline' className='w-full'>
                Compare
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
