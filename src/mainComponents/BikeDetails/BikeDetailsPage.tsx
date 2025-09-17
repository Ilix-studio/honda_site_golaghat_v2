import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import { ChevronLeft, Share2, UserCheck, Calendar, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "../Home/Header/Header";
import { Footer } from "../Home/Footer";

import { useGetBikeByIdQuery } from "../../redux-store/services/BikeSystemApi/bikeApi";
import { formatCurrency } from "../../lib/formatters";

const BikeDetailPage: React.FC = () => {
  const { bikeId } = useParams<{ bikeId: string }>();
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState("Standard");
  const [selectedColor, setSelectedColor] = useState("");

  const {
    data: bikeResponse,
    isLoading,
    error,
  } = useGetBikeByIdQuery(bikeId || "");

  const bike = bikeResponse?.data;

  // Set initial color when bike data loads
  useEffect(() => {
    if (bike?.colors && bike.colors.length > 0 && !selectedColor) {
      setSelectedColor(bike.colors[0]);
    }
  }, [bike, selectedColor]);

  const handleBookNow = () => {
    if (bike) {
      navigate(`/book-service?bikeId=${bike._id}`);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: bike?.modelName,
          text: `Check out this ${bike?.modelName}`,
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
    navigate("/finance-application");
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className='min-h-screen bg-gray-50 pt-20'>
          <div className='container max-w-6xl px-4 py-8'>
            <div className='animate-pulse'>
              <div className='h-8 bg-gray-300 rounded w-1/4 mb-6'></div>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                <div className='h-96 bg-gray-300 rounded-lg'></div>
                <div className='space-y-4'>
                  <div className='h-8 bg-gray-300 rounded w-3/4'></div>
                  <div className='h-6 bg-gray-300 rounded w-1/2'></div>
                  <div className='h-32 bg-gray-300 rounded'></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !bike) {
    return (
      <>
        <Header />
        <main className='min-h-screen bg-gray-50 pt-20'>
          <div className='container max-w-6xl px-4 py-8'>
            <div className='text-center py-16'>
              <h1 className='text-2xl font-bold mb-4'>Bike Not Found</h1>
              <p className='text-muted-foreground mb-6'>
                The bike you're looking for doesn't exist or has been removed.
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

  const getPrimaryImageUrl = (): string => {
    if (bike?.images && Array.isArray(bike.images) && bike.images.length > 0) {
      const primaryImage = bike.images.find((img) => img.isPrimary);
      if (primaryImage?.src) return primaryImage.src;

      const firstImage = bike.images[0];
      if (firstImage?.src) return firstImage.src;
    }
    return "/api/placeholder/600/400";
  };

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
                All Bikes
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
            {/* Image Section */}
            <div className='space-y-4'>
              <div className='aspect-video bg-white rounded-lg border overflow-hidden'>
                <img
                  src={getPrimaryImageUrl()}
                  alt={bike.modelName}
                  className='w-full h-full object-cover'
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/api/placeholder/600/400";
                  }}
                />
              </div>

              {/* Thumbnail Images */}
              {bike.images && bike.images.length > 1 && (
                <div className='flex gap-2 overflow-x-auto'>
                  {bike.images.slice(0, 4).map((image, index) => (
                    <div
                      key={index}
                      className='w-20 h-20 bg-white rounded border flex-shrink-0 overflow-hidden cursor-pointer hover:border-primary'
                    >
                      <img
                        src={image.src}
                        alt={`${bike.modelName} ${index + 1}`}
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
            </div>

            {/* Details Section */}
            <div className='space-y-6'>
              {/* Header */}
              <div>
                <h1 className='text-3xl font-bold mb-2'>{bike.modelName}</h1>
                <p className='text-2xl font-semibold text-primary mb-4'>
                  {formatCurrency(
                    bike.priceBreakdown?.onRoadPrice ||
                      bike.priceBreakdown?.exShowroomPrice ||
                      0
                  )}
                </p>
                <div className='flex gap-2 mb-4'>
                  <Badge variant='outline' className='capitalize'>
                    {bike.category}
                  </Badge>
                  <Badge
                    variant={
                      bike.stockAvailable > 0 ? "default" : "destructive"
                    }
                  >
                    {bike.stockAvailable > 0 ? "In Stock" : "Out of Stock"}
                  </Badge>
                  <Badge variant='outline'>{bike.year}</Badge>
                </div>
              </div>

              {/* Variant Selection */}
              {bike.variants && bike.variants.length > 0 && (
                <div>
                  <h3 className='font-semibold mb-3'>Variant</h3>
                  <div className='flex gap-2'>
                    {bike.variants.map((variant) => (
                      <button
                        key={variant.name}
                        onClick={() => setSelectedVariant(variant.name)}
                        className={`px-4 py-2 border rounded-lg text-sm ${
                          selectedVariant === variant.name
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Specifications Card */}
              <Card>
                <CardContent className='pt-6'>
                  <h3 className='font-semibold mb-4'>Key Specifications</h3>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='text-muted-foreground'>Engine:</span>
                      <p className='font-medium'>{bike.engineSize || "N/A"}</p>
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

              {/* Available Colors */}
              {bike.colors && bike.colors.length > 0 && (
                <div>
                  <h3 className='font-semibold mb-3'>Available Colors</h3>
                  <div className='flex gap-2 flex-wrap'>
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
                  disabled={bike.stockAvailable === 0}
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

              {/* Stock Information */}
              {bike.stockAvailable > 0 && (
                <div className='p-4 bg-blue-50 rounded-lg'>
                  <p className='text-sm text-blue-800'>
                    <strong>Stock Available:</strong> {bike.stockAvailable}{" "}
                    units
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Price Breakdown Section */}
          <Card className='mt-8'>
            <CardContent className='pt-6'>
              <h3 className='text-lg font-semibold mb-4'>
                Honda Shine 100 On Road Price in Golaghat
              </h3>
              <div className='space-y-3'>
                <div className='flex justify-between items-center py-2 border-b'>
                  <span className='text-muted-foreground'>Ex-showroom</span>
                  <span className='font-medium'>
                    {formatCurrency(bike.priceBreakdown?.exShowroomPrice || 0)}
                  </span>
                </div>
                <div className='flex justify-between items-center py-2 border-b'>
                  <span className='text-muted-foreground'>RTO</span>
                  <span className='font-medium'>
                    {formatCurrency(bike.priceBreakdown?.rtoCharges || 0)}
                  </span>
                </div>
                <div className='flex justify-between items-center py-2 border-b'>
                  <span className='text-muted-foreground'>
                    Insurance (Comprehensive)
                  </span>
                  <span className='font-medium'>
                    {formatCurrency(
                      bike.priceBreakdown?.insuranceComprehensive || 0
                    )}
                  </span>
                </div>
                <div className='flex justify-between items-center py-3 bg-gray-50 px-4 rounded-lg'>
                  <span className='font-semibold flex items-center gap-2'>
                    On Road Price in Golaghat
                    <Info className='h-4 w-4 text-muted-foreground' />
                  </span>
                  <span className='text-lg font-bold'>
                    {formatCurrency(bike.priceBreakdown?.onRoadPrice || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information Sections */}
          <div className='mt-8 grid grid-cols-1 md:grid-cols-2 gap-8'>
            {/* Financing Options */}
            <Card>
              <CardContent className='pt-6'>
                <h3 className='font-semibold mb-4'>Financing Options</h3>
                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span>EMI from:</span>
                    <span className='font-medium'>
                      {formatCurrency(
                        Math.round((bike.priceBreakdown?.onRoadPrice || 0) / 36)
                      )}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Down Payment:</span>
                    <span className='font-medium'>
                      {formatCurrency(
                        Math.round(
                          (bike.priceBreakdown?.onRoadPrice || 0) * 0.2
                        )
                      )}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Interest Rate:</span>
                    <span className='font-medium'>9.5% onwards</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Information */}
            <Card>
              <CardContent className='pt-6'>
                <h3 className='font-semibold mb-4'>Service Information</h3>
                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span>Service Interval:</span>
                    <span className='font-medium'>6 months / 10,000 km</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Warranty:</span>
                    <span className='font-medium'>3 years / 30,000 km</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Fuel Norms:</span>
                    <span className='font-medium'>{bike.fuelNorms}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default BikeDetailPage;
