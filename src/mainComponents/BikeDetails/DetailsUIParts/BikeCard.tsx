import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "../../../lib/formatters";
import { Link } from "react-router-dom";
import { Bike } from "../../../redux-store/slices/BikeSystemSlice/bikesSlice";
import { AlertTriangle, Star, Fuel, Calendar, Zap } from "lucide-react";

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
              <p className='text-sm text-red-600'>Error loading vehicle data</p>
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
  // Safe image URL extraction - using the images array from your bike model
  const getPrimaryImageUrl = (): string => {
    if (bike?.images && Array.isArray(bike.images) && bike.images.length > 0) {
      // Find primary image first
      const primaryImage = bike.images.find((img) => img.isPrimary);
      if (primaryImage?.src) return primaryImage.src;

      // Fallback to first image
      const firstImage = bike.images[0];
      if (firstImage?.src) return firstImage.src;
    }
    return "/api/placeholder/400/300";
  };

  // Safe currency formatting using your price breakdown
  const formatPrice = (): string => {
    const onRoadPrice = bike?.priceBreakdown?.onRoadPrice;
    const exShowroomPrice = bike?.priceBreakdown?.exShowroomPrice;

    const price = onRoadPrice || exShowroomPrice;

    if (typeof price !== "number" || isNaN(price)) return "Price on Request";

    try {
      return formatCurrency(price);
    } catch {
      return `₹${price.toLocaleString("en-IN")}`;
    }
  };

  // Safe bike ID extraction
  const getBikeId = (): string => {
    return bike?._id || "";
  };

  // Get category display name
  const getCategoryDisplay = (): string => {
    const category = bike?.category;
    if (!category) return "Unknown";
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Get main category display
  const getMainCategoryDisplay = (): string => {
    const mainCategory = bike?.mainCategory;
    if (!mainCategory) return "Vehicle";
    return mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1);
  };

  // Validate required bike properties
  if (!bike || typeof bike !== "object") {
    throw new Error("Invalid bike data provided");
  }

  const bikeId = getBikeId();
  const modelName = bike.modelName || "Unknown Model";
  const category = getCategoryDisplay();
  const mainCategory = getMainCategoryDisplay();
  const engineSize = bike.engineSize || "N/A";
  const power = bike.power || 0;
  // const transmission = bike.transmission || "N/A";
  const year = bike.year || new Date().getFullYear();
  const features = Array.isArray(bike.features) ? bike.features : [];
  const colors = Array.isArray(bike.colors) ? bike.colors : [];
  const isNewModel = Boolean(bike.isNewModel);
  const inStock = (bike.stockAvailable || 0) > 0;
  const fuelNorms = bike.fuelNorms || "BS6";
  const isE20Efficiency = Boolean(bike.isE20Efficiency);

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
      <Card className='overflow-hidden h-full flex flex-col shadow-md hover:shadow-lg transition-shadow'>
        <div className='relative'>
          <Link to={`/${mainCategory.toLowerCase()}s/${bikeId}`}>
            <div className='aspect-[4/3] relative overflow-hidden bg-gray-100'>
              <img
                src={getPrimaryImageUrl()}
                alt={`${modelName} - ${year}`}
                className='object-cover transition-transform duration-300 hover:scale-105 w-full h-full'
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/api/placeholder/400/300";
                }}
                loading='lazy'
              />
            </div>
          </Link>

          {/* Badges */}
          <div className='absolute top-2 right-2 flex flex-col gap-1'>
            {isNewModel && (
              <Badge className='bg-red-600 hover:bg-red-700 text-white'>
                New
              </Badge>
            )}
            {isE20Efficiency && (
              <Badge className='bg-green-600 hover:bg-green-700 text-white'>
                E20
              </Badge>
            )}
          </div>

          {!inStock && (
            <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
              <Badge className='bg-gray-800 text-white text-sm px-3 py-1'>
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        <CardContent className='p-4 flex flex-col flex-grow'>
          {/* Header */}
          <div className='mb-3'>
            <div className='flex justify-between items-start gap-2'>
              <div className='flex-1 min-w-0'>
                <h3 className='font-bold text-lg text-gray-900 truncate'>
                  {modelName}
                </h3>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <span className='capitalize'>{category}</span>
                  <span>•</span>
                  <span className='flex items-center gap-1'>
                    <Calendar className='h-3 w-3' />
                    {year}
                  </span>
                </div>
              </div>
              <div className='text-right'>
                <div className='text-red-600 font-bold text-lg'>
                  {formatPrice()}
                </div>
                <div className='text-xs text-muted-foreground'>
                  On-Road Price
                </div>
              </div>
            </div>
          </div>

          {/* Specifications Grid */}
          <div className='grid grid-cols-2 gap-3 text-sm mb-4'>
            <div className='flex items-center gap-2'>
              <Zap className='h-4 w-4 text-blue-500' />
              <div>
                <div className='text-muted-foreground text-xs'>Engine</div>
                <div className='font-medium'>{engineSize}</div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Star className='h-4 w-4 text-yellow-500' />
              <div>
                <div className='text-muted-foreground text-xs'>Power</div>
                <div className='font-medium'>{power} HP</div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Fuel className='h-4 w-4 text-green-500' />
              <div>
                <div className='text-muted-foreground text-xs'>Fuel Norms</div>
                <div className='font-medium'>{fuelNorms}</div>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-4 w-4 rounded-full bg-gray-400' />
              <div>
                <div className='text-muted-foreground text-xs'>Colors</div>
                <div className='font-medium'>{colors.length || 0}</div>
              </div>
            </div>
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div className='mb-4'>
              <div className='flex flex-wrap gap-1'>
                {features.slice(0, 2).map((feature, index) => (
                  <Badge
                    key={`${bikeId}-feature-${index}`}
                    variant='secondary'
                    className='text-xs'
                  >
                    {feature}
                  </Badge>
                ))}
                {features.length > 2 && (
                  <Badge variant='outline' className='text-xs'>
                    +{features.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className='mt-auto flex gap-2'>
            <Link
              to={`/${mainCategory.toLowerCase()}s/${bikeId}`}
              className='flex-1'
            >
              <Button
                className='w-full bg-red-600 hover:bg-red-700 text-white'
                disabled={!inStock}
                size='sm'
              >
                {inStock ? "View Details" : "Out of Stock"}
              </Button>
            </Link>
            <Link
              to={`/compare?${mainCategory.toLowerCase()}s=${bikeId}`}
              className='flex-1'
            >
              <Button variant='outline' className='w-full' size='sm'>
                Compare
              </Button>
            </Link>
          </div>

          {/* Stock Status */}
          {inStock && (
            <div className='mt-2 text-center'>
              <span className='text-xs text-green-600 font-medium'>
                ✓ In Stock ({bike.stockAvailable} available)
              </span>
            </div>
          )}
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
