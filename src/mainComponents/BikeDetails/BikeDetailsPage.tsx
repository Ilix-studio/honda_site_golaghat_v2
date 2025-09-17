import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query"; // Import skipToken

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  Share2,
  Calculator,
  Loader2,
  AlertCircle,
  Stamp,
} from "lucide-react";

import { Footer } from "../Home/Footer";
import { formatCurrency } from "../../lib/formatters";

// Redux
import { useGetBikeByIdQuery } from "../../redux-store/services/BikeSystemApi/bikeApi";
import { useAppDispatch } from "../../hooks/redux";
import { addNotification } from "../../redux-store/slices/uiSlice";
import { Header } from "../Home/Header/Header";

export default function BikeDetailsPage() {
  const { bikeId } = useParams<{ bikeId: string }>();
  const dispatch = useAppDispatch();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const navigate = useNavigate();

  // Use skipToken when bikeId is undefined to prevent unnecessary API calls
  const {
    data: bikeResponse,
    isLoading,
    isError,
  } = useGetBikeByIdQuery(bikeId ?? skipToken);

  const bike = bikeResponse?.data;

  useEffect(() => {
    if (bike?.colors && bike.colors.length > 0) {
      setSelectedColor(bike.colors[0]);
    }
  }, [bike]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: bike?.modelName || "Honda Motorcycle",
          text: `Check out this ${bike?.modelName} motorcycle!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(window.location.href);
      dispatch(
        addNotification({
          type: "success",
          message: "Link copied to clipboard!",
        })
      );
    }
  };

  const handleFinance = () => {
    navigate("/finance");
  };

  const handleBookNow = () => {
    dispatch(
      addNotification({
        type: "info",
        message: "Booking feature coming soon!",
      })
    );
  };

  // Handle case when no bikeId is provided
  if (!bikeId) {
    return (
      <>
        <Header />
        <main className='min-h-screen bg-gray-50 pt-20'>
          <div className='container max-w-4xl px-4 py-8'>
            <div className='text-center'>
              <AlertCircle className='h-16 w-16 text-red-500 mx-auto mb-4' />
              <h1 className='text-3xl font-bold mb-4'>Invalid Bike ID</h1>
              <p className='text-muted-foreground mb-6'>
                No bike ID was provided in the URL.
              </p>
              <Link to='/view-all'>
                <Button>
                  <ChevronLeft className='h-4 w-4 mr-2' />
                  Browse All Bikes
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <>
        <Header />
        <main className='min-h-screen bg-gray-50 pt-20'>
          <div className='container max-w-6xl px-4 py-8'>
            <div className='flex items-center justify-center min-h-[60vh]'>
              <div className='text-center'>
                <Loader2 className='h-12 w-12 animate-spin mx-auto mb-4 text-blue-600' />
                <h2 className='text-xl font-semibold mb-2'>
                  Loading Bike Details
                </h2>
                <p className='text-muted-foreground'>
                  Please wait while we fetch the information...
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Error state or bike not found
  if (isError || !bike) {
    return (
      <>
        <Header />
        <main className='min-h-screen bg-gray-50 pt-20'>
          <div className='container max-w-4xl px-4 py-8'>
            <div className='text-center'>
              <AlertCircle className='h-16 w-16 text-red-500 mx-auto mb-4' />
              <h1 className='text-3xl font-bold mb-4'>Bike Not Found</h1>
              <p className='text-muted-foreground mb-6'>
                {isError
                  ? "There was an error loading the bike details. Please try again later."
                  : "The bike you're looking for doesn't exist or has been removed."}
              </p>
              <div className='flex gap-4 justify-center'>
                <Link to='/view-all'>
                  <Button>
                    <ChevronLeft className='h-4 w-4 mr-2' />
                    Browse All Bikes
                  </Button>
                </Link>
                <Button
                  variant='outline'
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className='min-h-screen bg-gray-50 pt-20'>
        {/* Breadcrumb Navigation */}
        <div className='bg-white border-b'>
          <div className='container px-4 py-4'>
            <nav className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Link to='/' className='hover:text-primary'>
                Home
              </Link>
              <span>/</span>
              <Link to='/view-all' className='hover:text-primary'>
                Motorcycles
              </Link>
              <span>/</span>
              <span className='text-foreground font-medium'>
                {bike.modelName}
              </span>
            </nav>
          </div>
        </div>

        <div className='container max-w-6xl px-4 py-8'>
          {/* Back Button */}
          <Link to='/view-all'>
            <Button variant='outline' className='mb-6'>
              <ChevronLeft className='h-4 w-4 mr-2' />
              Back to All Bikes
            </Button>
          </Link>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Image Gallery */}
            <div className='space-y-4'>
              <div className='aspect-video bg-white rounded-lg border overflow-hidden'>
                {bike.images && bike.images.length > 0 ? (
                  <img
                    src={
                      bike.images[selectedImageIndex] || "/placeholder/600/400"
                    }
                    alt={bike.modelName}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center bg-gray-100'>
                    <span className='text-muted-foreground'>
                      No image available
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {bike.images && bike.images.length > 1 && (
                <div className='flex gap-2 overflow-x-auto'>
                  {bike.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 border rounded-lg overflow-hidden ${
                        selectedImageIndex === index
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={image || "/placeholder/80/80"}
                        alt={`${bike.modelName} view ${index + 1}`}
                        className='w-full h-full object-cover'
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className='space-y-6'>
              <div>
                <h1 className='text-3xl font-bold mb-2'>{bike.modelName}</h1>
                <p className='text-2xl font-bold text-primary mb-4'>
                  {formatCurrency(bike.price)}
                </p>

                {/* Badges */}
                <div className='flex gap-2 mb-4'>
                  <Badge variant='secondary' className='capitalize'>
                    {bike.category}
                  </Badge>
                  <Badge variant={bike.inStock ? "default" : "destructive"}>
                    {bike.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                  <Badge variant='outline'>{bike.year}</Badge>
                </div>
              </div>

              {/* Specifications */}
              <Card>
                <CardContent className='pt-6'>
                  <h3 className='font-semibold mb-4'>Key Specifications</h3>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='text-muted-foreground'>Engine:</span>
                      <p className='font-medium'>{bike.engine}</p>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Power:</span>
                      <p className='font-medium'>{bike.power} HP</p>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>
                        Transmission:
                      </span>
                      <p className='font-medium'>{bike.transmission}</p>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Year:</span>
                      <p className='font-medium'>{bike.year}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Color Selection */}
              {bike.colors && bike.colors.length > 0 && (
                <div>
                  <h3 className='font-semibold mb-3'>Available Colors</h3>
                  <div className='flex gap-2'>
                    {bike.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-2 border rounded-lg text-sm capitalize ${
                          selectedColor === color
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              {bike.features && bike.features.length > 0 && (
                <div>
                  <h3 className='font-semibold mb-3'>Features</h3>
                  <div className='flex flex-wrap gap-2'>
                    {bike.features.map((feature, index) => (
                      <Badge key={index} variant='outline'>
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className='space-y-4'>
                <Button
                  onClick={handleBookNow}
                  disabled={!bike.inStock}
                  className='w-full'
                  size='lg'
                >
                  <Calculator className='h-4 w-4 mr-2' />
                  Book Now
                </Button>

                <div className='grid grid-cols-2 gap-4'>
                  <Button
                    onClick={handleShare}
                    variant='outline'
                    className='w-full'
                  >
                    <Share2 className='h-4 w-4 mr-2' />
                    Share
                  </Button>
                  <Button
                    onClick={handleFinance}
                    variant='outline'
                    className='w-full'
                  >
                    <Stamp className='h-4 w-4 mr-2' />
                    Get Approved
                  </Button>
                </div>
              </div>

              {/* Stock Information */}
              {bike.quantity !== undefined && (
                <div className='p-4 bg-blue-50 rounded-lg'>
                  <p className='text-sm text-blue-800'>
                    <strong>Stock Available:</strong> {bike.quantity} units
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information Sections */}
          <div className='mt-12 grid grid-cols-1 md:grid-cols-2 gap-8'>
            {/* Financing Options */}
            <Card>
              <CardContent className='pt-6'>
                <h3 className='font-semibold mb-4'>Financing Options</h3>
                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span>EMI from:</span>
                    <span className='font-medium'>
                      {formatCurrency(Math.round(bike.price / 36))}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Down Payment:</span>
                    <span className='font-medium'>
                      {formatCurrency(Math.round(bike.price * 0.2))}
                    </span>
                  </div>
                  <Link to='/finance'>
                    <Button variant='outline' size='sm' className='w-full mt-4'>
                      Calculate EMI
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Service Information */}
            <Card>
              <CardContent className='pt-6'>
                <h3 className='font-semibold mb-4'>Service & Support</h3>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm'>2 Years Warranty</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm'>Free Service for 6 months</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm'>24/7 Roadside Assistance</span>
                  </div>
                  <Link to='/book-service'>
                    <Button variant='outline' size='sm' className='w-full mt-4'>
                      Book Service
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
