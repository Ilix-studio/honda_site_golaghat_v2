import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "../../../lib/formatters";
import { Link } from "react-router-dom";
import { Bike } from "../../../redux-store/slices/bikesSlice";
import { AlertTriangle } from "lucide-react";

interface BikeCardProps {
  bike: Bike;
}

// Error Boundary Component
class BikeCardErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("BikeCard Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Card className='border-red-200 bg-red-50'>
            <CardContent className='p-4 text-center'>
              <AlertTriangle className='h-8 w-8 text-red-500 mx-auto mb-2' />
              <p className='text-sm text-red-600'>Error loading bike data</p>
            </CardContent>
          </Card>
        )
      );
    }

    return this.props.children;
  }
}

// Safe BikeCard Component
function SafeBikeCard({ bike }: BikeCardProps) {
  // Safely extract engine size with fallbacks
  const getEngineSize = (engineString?: string): string => {
    if (!engineString || typeof engineString !== "string") return "N/A";
    const match = engineString.match(/(\d+(?:\.\d+)?)/);
    return match ? `${match[1]}cc` : engineString;
  };

  // Safe image URL extraction
  const getImageUrl = (): string => {
    if (bike?.images && Array.isArray(bike.images) && bike.images.length > 0) {
      return bike.images[0];
    }
    return "/placeholder.svg";
  };

  // Safe currency formatting
  const formatPrice = (price?: number): string => {
    if (typeof price !== "number" || isNaN(price)) return "Price N/A";
    try {
      return formatCurrency(price);
    } catch {
      return `₹${price.toLocaleString("en-IN")}`;
    }
  };

  // Safe bike ID extraction
  const getBikeId = (): string => {
    return bike?._id || bike?.id || "";
  };

  // Validate required bike properties
  if (!bike || typeof bike !== "object") {
    throw new Error("Invalid bike data provided");
  }

  const bikeId = getBikeId();
  const modelName = bike.modelName || "Unknown Model";
  const category = bike.category || "Unknown";
  const price = bike.price;
  const engine = bike.engine;
  const power = bike.power || "N/A";
  const transmission = bike.transmission || "N/A";
  const year = bike.year || "N/A";
  const features = Array.isArray(bike.features) ? bike.features : [];
  const isNewModel = Boolean(bike.isNewModel);
  const inStock = bike.inStock !== false; // Default to true if undefined

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
          <Link to={`/bikes/${bikeId}`}>
            <div className='aspect-[4/3] relative overflow-hidden'>
              <img
                src={getImageUrl()}
                alt={modelName}
                className='object-cover transition-transform duration-300 hover:scale-105 w-full h-full'
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            </div>
          </Link>
          {isNewModel && (
            <Badge className='absolute top-2 right-2 bg-red-600'>New</Badge>
          )}
          {!inStock && (
            <Badge className='absolute top-2 left-2 bg-gray-600'>
              Out of Stock
            </Badge>
          )}
        </div>

        <CardContent className='p-4 flex flex-col flex-grow'>
          <div className='mb-2'>
            <div className='flex justify-between items-start'>
              <h3 className='font-bold text-lg truncate pr-2'>{modelName}</h3>
              <span className='text-red-600 font-semibold text-sm'>
                {formatPrice(price)}
              </span>
            </div>
            <p className='text-sm text-muted-foreground capitalize'>
              {category}
            </p>
          </div>

          <div className='grid grid-cols-2 gap-2 text-sm mb-4'>
            <div className='flex flex-col'>
              <span className='text-muted-foreground'>Engine</span>
              <span>{getEngineSize(engine)}</span>
            </div>
            <div className='flex flex-col'>
              <span className='text-muted-foreground'>Power</span>
              <span>{power} HP</span>
            </div>
            <div className='flex flex-col'>
              <span className='text-muted-foreground'>Transmission</span>
              <span>{transmission}</span>
            </div>
            <div className='flex flex-col'>
              <span className='text-muted-foreground'>Year</span>
              <span>{year}</span>
            </div>
          </div>

          {features.length > 0 && (
            <div className='flex flex-wrap gap-1 mb-4'>
              {features.slice(0, 3).map((feature, index) => (
                <Badge
                  key={`${bikeId}-feature-${index}`}
                  variant='secondary'
                  className='text-xs'
                >
                  {feature}
                </Badge>
              ))}
              {features.length > 3 && (
                <Badge variant='outline' className='text-xs'>
                  +{features.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <div className='mt-auto flex gap-2'>
            <Link to={`/bikes/${bikeId}`} className='flex-1'>
              <Button
                className='w-full bg-red-600 hover:bg-red-700'
                disabled={!inStock}
              >
                {inStock ? "Details" : "Out of Stock"}
              </Button>
            </Link>
            <Link to={`/compare?bikes=${bikeId}`} className='flex-1'>
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

// Main export with error boundary
export function BikeCard({ bike }: BikeCardProps) {
  return (
    <BikeCardErrorBoundary>
      <SafeBikeCard bike={bike} />
    </BikeCardErrorBoundary>
  );
}
