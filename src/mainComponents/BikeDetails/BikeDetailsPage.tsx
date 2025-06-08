import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Share2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { formatCurrency } from "../../lib/formatters";
import { EmiCalculator } from "../EmiCalculator";

// Redux

import { useComparison } from "../../hooks/useComparison";
import { useAppDispatch } from "../../hooks/redux";
import { addNotification } from "../../redux-store/slices/uiSlice";
import { useGetBikeByIdQuery } from "@/redux-store/services/bikeApi";

const BikeDetailsPage = () => {
  const { bikeId } = useParams<{ bikeId: string }>();
  const dispatch = useAppDispatch();
  const { addBike, selectedBikeIds, canAddMore } = useComparison();

  const {
    data: bikeResponse,
    isLoading,
    error,
  } = useGetBikeByIdQuery(bikeId || "");

  const bike = bikeResponse?.data;

  const handleAddToComparison = () => {
    if (bike && canAddMore && !selectedBikeIds.includes(bike.id)) {
      addBike(bike.id);
      dispatch(
        addNotification({
          type: "success",
          message: `${bike.modelName} added to comparison`,
        })
      );
    } else if (selectedBikeIds.includes(bike?.id || "")) {
      dispatch(
        addNotification({
          type: "info",
          message: "This bike is already in your comparison",
        })
      );
    } else if (!canAddMore) {
      dispatch(
        addNotification({
          type: "warning",
          message: "You can only compare up to 4 bikes at once",
        })
      );
    }
  };

  const handleShare = async () => {
    if (navigator.share && bike) {
      try {
        await navigator.share({
          title: bike.modelName,
          text: `Check out this ${bike.modelName} motorcycle!`,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      dispatch(
        addNotification({
          type: "success",
          message: "Link copied to clipboard!",
        })
      );
    });
  };

  if (isLoading) {
    return (
      <main className='min-h-screen flex flex-col'>
        <Header />
        <div className='flex-grow flex items-center justify-center'>
          <div className='animate-spin h-8 w-8 border-4 border-red-600 rounded-full border-t-transparent'></div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !bike) {
    return (
      <main className='min-h-screen flex flex-col'>
        <Header />
        <div className='container pt-28 pb-10 px-4 flex-grow'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold mb-4'>Motorcycle Not Found</h1>
            <p className='text-muted-foreground mb-4'>
              The motorcycle you're looking for doesn't exist or has been
              removed.
            </p>
            <Link to='/view-all'>
              <Button>Browse All Motorcycles</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className='min-h-screen flex flex-col'>
      <Header />

      <div className='container pt-28 pb-10 px-4 flex-grow'>
        {/* Breadcrumb */}
        <div className='mb-6'>
          <Link to='/view-all'>
            <Button
              variant='ghost'
              className='pl-0 flex items-center text-muted-foreground hover:text-foreground'
            >
              <ArrowLeft className='h-4 w-4 mr-1' />
              Back to All Bikes
            </Button>
          </Link>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12'>
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className='aspect-[4/3] relative overflow-hidden rounded-lg'>
              <img
                src={bike.images?.[0] || "/placeholder.svg"}
                alt={bike.modelName}
                className='w-full h-full object-cover'
              />
              {bike.isNew && (
                <Badge className='absolute top-4 right-4 bg-red-600'>New</Badge>
              )}
            </div>
          </motion.div>

          {/* Bike Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className='space-y-6'
          >
            <div>
              <h1 className='text-3xl font-bold mb-2'>{bike.modelName}</h1>
              <p className='text-lg text-muted-foreground capitalize mb-4'>
                {bike.category}
              </p>
              <div className='text-3xl font-bold text-red-600 mb-6'>
                {formatCurrency(bike.price)}
              </div>
            </div>

            {/* Key Specs */}
            <Card>
              <CardContent className='p-6'>
                <h3 className='font-semibold mb-4'>Key Specifications</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Engine</p>
                    <p className='font-medium'>{bike.engine}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Power</p>
                    <p className='font-medium'>{bike.power} HP</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Weight</p>
                    <p className='font-medium'>{bike.weight} kg</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Year</p>
                    <p className='font-medium'>{bike.year}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className='space-y-3'>
              <div className='flex gap-3'>
                <Button className='flex-1 bg-red-600 hover:bg-red-700'>
                  <ShoppingCart className='h-4 w-4 mr-2' />
                  Book Test Ride
                </Button>
                <Button variant='outline' onClick={handleShare}>
                  <Share2 className='h-4 w-4' />
                </Button>
                <Button variant='outline'>
                  <Heart className='h-4 w-4' />
                </Button>
              </div>

              <Button
                variant='outline'
                className='w-full'
                onClick={handleAddToComparison}
                disabled={!canAddMore && !selectedBikeIds.includes(bike.id)}
              >
                {selectedBikeIds.includes(bike.id)
                  ? "Already in Comparison"
                  : "Add to Comparison"}
              </Button>

              {selectedBikeIds.length > 0 && (
                <Link to='/compare' className='block'>
                  <Button variant='ghost' className='w-full'>
                    View Comparison ({selectedBikeIds.length})
                  </Button>
                </Link>
              )}
            </div>

            {/* Features */}
            {bike.features && bike.features.length > 0 && (
              <div>
                <h3 className='font-semibold mb-3'>Features</h3>
                <div className='flex flex-wrap gap-2'>
                  {bike.features.map((feature, index) => (
                    <Badge key={index} variant='secondary'>
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Available Colors */}
            {bike.colors && bike.colors.length > 0 && (
              <div>
                <h3 className='font-semibold mb-3'>Available Colors</h3>
                <div className='flex flex-wrap gap-2'>
                  {bike.colors.map((color, index) => (
                    <Badge key={index} variant='outline'>
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* EMI Calculator */}
        <EmiCalculator selectedBikePrice={bike.price} />
      </div>

      <Footer />
    </main>
  );
};

export default BikeDetailsPage;
