import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import {
  ChevronLeft,
  Share2,
  UserCheck,
  Calendar,
  Info,
  Battery,
  Zap,
  Fuel,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "../Home/Header/Header";
import { Footer } from "../Home/Footer";

import { useGetBikeByIdQuery } from "../../redux-store/services/BikeSystemApi/bikeApi";
import { formatCurrency } from "../../lib/formatters";

const ScooterDetailPage: React.FC = () => {
  const { bikeId } = useParams<{ bikeId: string }>();
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState("Standard");
  const [selectedColor, setSelectedColor] = useState("");

  const {
    data: scooterResponse,
    isLoading,
    error,
  } = useGetBikeByIdQuery(bikeId || "");

  const scooter = scooterResponse?.data;

  // Set initial color when scooter data loads
  useEffect(() => {
    if (scooter?.colors && scooter.colors.length > 0 && !selectedColor) {
      setSelectedColor(scooter.colors[0]);
    }
  }, [scooter, selectedColor]);

  const handleBookNow = () => {
    if (scooter) {
      navigate(`/book-service?bikeId=${scooter._id}`);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: scooter?.modelName,
          text: `Check out this ${scooter?.modelName} scooter`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleGetApproved = () => {
    if (scooter) {
      navigate(`/finance?bikeId=${scooter._id}&type=scooter`);
    }
  };

  const getPrimaryImageUrl = () => {
    if (scooter?.images && scooter.images.length > 0) {
      const primaryImage = scooter.images.find((img) => img.isPrimary);
      return primaryImage?.src || scooter.images[0]?.src;
    }
    return "/api/placeholder/600/400";
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <Header />
        <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50'>
          <div className='container max-w-6xl px-4 py-8'>
            <div className='animate-pulse'>
              <div className='h-8 bg-gray-300 rounded w-32 mb-6'></div>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                <div className='space-y-4'>
                  <div className='aspect-video bg-gray-300 rounded-lg'></div>
                  <div className='flex gap-2'>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className='w-20 h-20 bg-gray-300 rounded'
                      ></div>
                    ))}
                  </div>
                </div>
                <div className='space-y-6'>
                  <div className='h-8 bg-gray-300 rounded w-3/4'></div>
                  <div className='h-6 bg-gray-300 rounded w-1/2'></div>
                  <div className='space-y-3'>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className='h-4 bg-gray-300 rounded'></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error || !scooter) {
    return (
      <>
        <Header />
        <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center'>
          <Card className='max-w-md'>
            <CardContent className='text-center p-6'>
              <Info className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h2 className='text-xl font-semibold mb-2'>Scooter Not Found</h2>
              <p className='text-gray-600 mb-4'>
                The scooter you're looking for doesn't exist or has been
                removed.
              </p>
              <Link to='/view-all?type=scooter'>
                <Button>View All Scooters</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  // Main content
  return (
    <>
      <Header />
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50'>
        {/* Breadcrumb */}
        <div className='bg-white border-b'>
          <div className='container max-w-6xl px-4 py-3'>
            <nav className='flex items-center space-x-2 text-sm text-gray-600'>
              <Link to='/' className='hover:text-primary'>
                Home
              </Link>
              <span>/</span>
              <Link to='/view-all?type=scooter' className='hover:text-primary'>
                Scooters
              </Link>
              <span>/</span>
              <span className='text-gray-900 font-medium'>
                {scooter.modelName}
              </span>
            </nav>
          </div>
        </div>

        <div className='container max-w-6xl px-4 py-8'>
          {/* Back Button */}
          <Link to='/view-all?type=scooter'>
            <Button variant='outline' className='mb-6'>
              <ChevronLeft className='h-4 w-4 mr-2' />
              Back to All Scooters
            </Button>
          </Link>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Image Section */}
            <div className='space-y-4'>
              <div className='aspect-video bg-white rounded-lg border overflow-hidden'>
                <img
                  src={getPrimaryImageUrl()}
                  alt={scooter.modelName}
                  className='w-full h-full object-cover'
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/api/placeholder/600/400";
                  }}
                />
              </div>

              {/* Thumbnail Images */}
              {scooter.images && scooter.images.length > 1 && (
                <div className='flex gap-2 overflow-x-auto'>
                  {scooter.images.slice(0, 4).map((image, index) => (
                    <div
                      key={index}
                      className='w-20 h-20 bg-white rounded border flex-shrink-0 overflow-hidden cursor-pointer hover:border-primary'
                    >
                      <img
                        src={image.src}
                        alt={`${scooter.modelName} ${index + 1}`}
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/api/placeholder/80/80";
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              <br />
              <div>
                <h1 className='text-3xl font-bold mb-2'>{scooter.modelName}</h1>
                <p className='text-2xl font-semibold text-primary mb-4'>
                  {formatCurrency(
                    scooter.priceBreakdown?.onRoadPrice ||
                      scooter.priceBreakdown?.exShowroomPrice ||
                      0
                  )}
                </p>
                <div className='flex gap-2 mb-4'>
                  <Badge variant='outline' className='capitalize'>
                    {scooter.category}
                  </Badge>
                  <Badge
                    variant={
                      scooter.stockAvailable > 0 ? "default" : "destructive"
                    }
                  >
                    {scooter.stockAvailable > 0 ? "In Stock" : "Out of Stock"}
                  </Badge>
                  {scooter.isNewModel && (
                    <Badge variant='secondary'>New Model</Badge>
                  )}
                  {scooter.fuelNorms === "Electric" && (
                    <Badge
                      variant='outline'
                      className='text-green-600 border-green-600'
                    >
                      <Zap className='h-3 w-3 mr-1' />
                      Electric
                    </Badge>
                  )}
                </div>
              </div>
              {/* Key Specifications - Scooter Specific */}
              <Card>
                <CardContent className='p-4'>
                  <h3 className='font-semibold mb-3'>Key Specifications</h3>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div className='flex items-center gap-2'>
                      <Battery className='h-4 w-4 text-gray-500' />
                      <span className='text-gray-600'>Engine:</span>
                      <span className='font-medium'>{scooter.engineSize}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Zap className='h-4 w-4 text-gray-500' />
                      <span className='text-gray-600'>Power:</span>
                      <span className='font-medium'>{scooter.power} HP</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Fuel className='h-4 w-4 text-gray-500' />
                      <span className='text-gray-600'>Fuel Norms:</span>
                      <span className='font-medium'>{scooter.fuelNorms}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Clock className='h-4 w-4 text-gray-500' />
                      <span className='text-gray-600'>Year:</span>
                      <span className='font-medium'>{scooter.year}</span>
                    </div>
                    {scooter.transmission && (
                      <>
                        <div className='flex items-center gap-2'>
                          <span className='text-gray-600'>Transmission:</span>
                          <span className='font-medium'>
                            {scooter.transmission}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='text-gray-600'>Stock:</span>
                          <span className='font-medium'>
                            {scooter.stockAvailable} units
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Details Section */}
            <div className='space-y-6'>
              {/* Price Breakdown */}
              {scooter.priceBreakdown && (
                <Card>
                  <CardContent className='p-4'>
                    <h3 className='font-semibold mb-3'>Price Breakdown</h3>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>
                          Ex-Showroom Price:
                        </span>
                        <span className='font-medium'>
                          {formatCurrency(
                            scooter.priceBreakdown.exShowroomPrice
                          )}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>RTO Charges:</span>
                        <span className='font-medium'>
                          {formatCurrency(scooter.priceBreakdown.rtoCharges)}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Insurance:</span>
                        <span className='font-medium'>
                          {formatCurrency(
                            scooter.priceBreakdown.insuranceComprehensive
                          )}
                        </span>
                      </div>
                      <hr className='my-2' />
                      <div className='flex justify-between font-semibold text-lg'>
                        <span>On-Road Price:</span>
                        <span className='text-primary'>
                          {formatCurrency(
                            scooter.priceBreakdown.onRoadPrice ||
                              scooter.priceBreakdown.exShowroomPrice +
                                scooter.priceBreakdown.rtoCharges +
                                scooter.priceBreakdown.insuranceComprehensive
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Variants Selection */}
              {scooter.variants && scooter.variants.length > 0 && (
                <div>
                  <h3 className='font-semibold mb-3'>Available Variants</h3>
                  <div className='grid grid-cols-1 gap-2'>
                    {scooter.variants.map((variant, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedVariant(variant.name)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          selectedVariant === variant.name
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-200 hover:border-gray-300"
                        } ${
                          !variant.isAvailable
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={!variant.isAvailable}
                      >
                        <div className='flex justify-between items-center'>
                          <span className='font-medium'>{variant.name}</span>
                          {variant.priceAdjustment !== 0 && (
                            <span className='text-sm text-gray-600'>
                              {variant.priceAdjustment > 0 ? "+" : ""}
                              {formatCurrency(variant.priceAdjustment)}
                            </span>
                          )}
                        </div>
                        {variant.features && variant.features.length > 0 && (
                          <div className='mt-1 text-xs text-gray-500'>
                            {variant.features.join(", ")}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {scooter.colors && scooter.colors.length > 0 && (
                <div>
                  <h3 className='font-semibold mb-3'>Available Colors</h3>
                  <div className='flex flex-wrap gap-2'>
                    {scooter.colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
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
              {scooter.features && scooter.features.length > 0 && (
                <div>
                  <h3 className='font-semibold mb-3'>Features</h3>
                  <div className='flex flex-wrap gap-2'>
                    {scooter.features.map((feature, index) => (
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
                  disabled={scooter.stockAvailable === 0}
                  className='w-full'
                  size='lg'
                >
                  <Calendar className='h-4 w-4 mr-2' />
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
                    onClick={handleGetApproved}
                    variant='outline'
                    className='w-full'
                  >
                    <UserCheck className='h-4 w-4 mr-2' />
                    Get Approved
                  </Button>
                </div>
              </div>

              {/* Warranty & Service Card */}
              <Card className='bg-green-50 border-green-200'>
                <CardContent className='p-4'>
                  <h4 className='font-semibold text-green-900 mb-3'>
                    Warranty & Service
                  </h4>
                  <div className='space-y-2 text-sm text-green-700'>
                    <div className='flex justify-between'>
                      <span>Engine Warranty:</span>
                      <span className='font-medium'>3 Years</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Service Network:</span>
                      <span className='font-medium'>200+ Centers</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Free Service:</span>
                      <span className='font-medium'>First 3 Services</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Compare Section */}
          <div className='mt-12'>
            <Card>
              <CardContent className='p-6'>
                <h3 className='text-xl font-semibold mb-4'>Compare Scooters</h3>
                <p className='text-gray-600 mb-4'>
                  Compare this scooter with other models to make the best choice
                  for your needs.
                </p>
                <Link to={`/compare?scooter=${scooter._id}`}>
                  <Button variant='outline'>Compare Scooters</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ScooterDetailPage;
