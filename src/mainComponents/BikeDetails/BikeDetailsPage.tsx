import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  Heart,
  Share2,
  Calculator,
  Calendar,
  Star,
  Plus,
  Minus,
} from "lucide-react";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { formatCurrency } from "../../lib/formatters";

// Redux
import { useGetBikeByIdQuery } from "../../redux-store/services/bikeApi";
import { useAppDispatch } from "../../hooks/redux";
import { addNotification } from "../../redux-store/slices/uiSlice";

export default function BikeDetailsPage() {
  const { bikeId } = useParams<{ bikeId: string }>();
  const dispatch = useAppDispatch();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  const {
    data: bikeResponse,
    isLoading,
    error,
  } = useGetBikeByIdQuery(bikeId || "");

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

  const handleAddToWishlist = () => {
    dispatch(
      addNotification({
        type: "success",
        message: `${bike?.modelName} added to wishlist!`,
      })
    );
  };

  const handleBookTestRide = () => {
    dispatch(
      addNotification({
        type: "info",
        message: "Test ride booking feature coming soon!",
      })
    );
  };

  const handlePriceCalculator = () => {
    // Scroll to EMI calculator section or redirect
    const emiSection = document.getElementById("finance");
    if (emiSection) {
      emiSection.scrollIntoView({ behavior: "smooth" });
    } else {
      // Navigate to home page finance section
      window.location.href = "/#finance";
    }
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
        <div className='container pt-28 pb-10 px-4 flex-grow text-center'>
          <h1 className='text-3xl font-bold mb-4'>Motorcycle Not Found</h1>
          <p className='text-muted-foreground mb-6'>
            The motorcycle you're looking for doesn't exist or has been removed.
          </p>
          <Link to='/view-all'>
            <Button>View All Motorcycles</Button>
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className='min-h-screen flex flex-col'>
      <Header />

      <div className='container pt-28 pb-10 px-4 flex-grow'>
        {/* Back button */}
        <div className='mb-6'>
          <Link to='/view-all'>
            <Button
              variant='ghost'
              className='pl-0 flex items-center text-muted-foreground hover:text-foreground'
            >
              <ChevronLeft className='h-4 w-4 mr-1' />
              Back to All Motorcycles
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
            <div className='space-y-4'>
              {/* Main Image */}
              <div className='aspect-[4/3] relative overflow-hidden rounded-lg border'>
                <img
                  src={bike.images?.[selectedImageIndex] || "/placeholder.svg"}
                  alt={bike.modelName}
                  className='w-full h-full object-cover'
                />
                {bike.year === new Date().getFullYear() && (
                  <Badge className='absolute top-4 right-4 bg-red-600'>
                    New
                  </Badge>
                )}
              </div>

              {/* Thumbnail Images */}
              {bike.images && bike.images.length > 1 && (
                <div className='flex gap-2 overflow-x-auto'>
                  {bike.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index
                          ? "border-red-600"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${bike.modelName} view ${index + 1}`}
                        className='w-full h-full object-cover'
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className='space-y-6'
          >
            {/* Title and Price */}
            <div>
              <div className='flex items-center gap-2 mb-2'>
                <Badge variant='outline' className='capitalize'>
                  {bike.category}
                </Badge>
                {bike.inStock ? (
                  <Badge className='bg-green-100 text-green-800'>
                    In Stock
                  </Badge>
                ) : (
                  <Badge variant='destructive'>Out of Stock</Badge>
                )}
              </div>
              <h1 className='text-3xl font-bold mb-2'>{bike.modelName}</h1>
              <div className='flex items-center gap-4'>
                <span className='text-3xl font-bold text-red-600'>
                  {formatCurrency(bike.price)}
                </span>
                <div className='flex items-center gap-1'>
                  <Star className='h-4 w-4 text-yellow-500 fill-yellow-500' />
                  <span className='text-sm font-medium'>4.8</span>
                  <span className='text-sm text-muted-foreground'>
                    (124 reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Key Specifications */}
            <Card>
              <CardContent className='p-6'>
                <h3 className='font-semibold mb-4'>Key Specifications</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <span className='text-sm text-muted-foreground'>
                      Engine
                    </span>
                    <p className='font-medium'>{bike.engine}</p>
                  </div>
                  <div>
                    <span className='text-sm text-muted-foreground'>Power</span>
                    <p className='font-medium'>{bike.power} HP</p>
                  </div>
                  <div>
                    <span className='text-sm text-muted-foreground'>
                      Transmission
                    </span>
                    <p className='font-medium'>{bike.transmission}</p>
                  </div>
                  <div>
                    <span className='text-sm text-muted-foreground'>Year</span>
                    <p className='font-medium'>{bike.year}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Colors */}
            {bike.colors && bike.colors.length > 0 && (
              <div>
                <h3 className='font-semibold mb-3'>Available Colors</h3>
                <div className='flex flex-wrap gap-2'>
                  {bike.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-2 rounded-md border transition-colors capitalize ${
                        selectedColor === color
                          ? "border-red-600 bg-red-50 text-red-600"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className='font-semibold mb-3'>Quantity</h3>
              <div className='flex items-center gap-3'>
                <div className='flex items-center border rounded-md'>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className='p-2 hover:bg-gray-100'
                    disabled={quantity <= 1}
                  >
                    <Minus className='h-4 w-4' />
                  </button>
                  <span className='px-4 py-2 font-medium'>{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className='p-2 hover:bg-gray-100'
                  >
                    <Plus className='h-4 w-4' />
                  </button>
                </div>
                {bike.quantity && (
                  <span className='text-sm text-muted-foreground'>
                    {bike.quantity} available
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className='space-y-3'>
              <div className='flex gap-3'>
                <Button
                  onClick={handleBookTestRide}
                  className='flex-1 bg-red-600 hover:bg-red-700'
                  disabled={!bike.inStock}
                >
                  <Calendar className='h-4 w-4 mr-2' />
                  Book Test Ride
                </Button>
                <Button
                  onClick={handleAddToWishlist}
                  variant='outline'
                  size='icon'
                >
                  <Heart className='h-4 w-4' />
                </Button>
                <Button onClick={handleShare} variant='outline' size='icon'>
                  <Share2 className='h-4 w-4' />
                </Button>
              </div>

              <Button
                onClick={handlePriceCalculator}
                variant='outline'
                className='w-full'
              >
                <Calculator className='h-4 w-4 mr-2' />
                Calculate EMI
              </Button>

              <Link to={`/compare?bikes=${bike.id}`}>
                <Button variant='outline' className='w-full'>
                  Compare with Other Models
                </Button>
              </Link>
            </div>

            {/* Contact Info */}
            <div className='p-4 bg-gray-50 rounded-lg'>
              <h4 className='font-medium mb-2'>Need Help?</h4>
              <p className='text-sm text-muted-foreground mb-2'>
                Contact our sales team for more information
              </p>
              <p className='text-sm font-medium'>📞 883920-2092122</p>
            </div>
          </motion.div>
        </div>

        {/* Features */}
        {bike.features && bike.features.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className='mb-12'
          >
            <Card>
              <CardContent className='p-6'>
                <h3 className='text-xl font-semibold mb-4'>Features</h3>
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
                  {bike.features.map((feature, index) => (
                    <div
                      key={index}
                      className='flex items-center gap-2 p-3 bg-gray-50 rounded-md'
                    >
                      <div className='w-2 h-2 bg-red-600 rounded-full' />
                      <span className='text-sm'>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Detailed Specifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardContent className='p-6'>
              <h3 className='text-xl font-semibold mb-6'>
                Detailed Specifications
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <h4 className='font-medium text-lg border-b pb-2'>
                    Engine & Performance
                  </h4>
                  <div className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Engine Type</span>
                      <span className='font-medium'>{bike.engine}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Power</span>
                      <span className='font-medium'>{bike.power} HP</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        Transmission
                      </span>
                      <span className='font-medium'>{bike.transmission}</span>
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <h4 className='font-medium text-lg border-b pb-2'>
                    General Information
                  </h4>
                  <div className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Category</span>
                      <span className='font-medium capitalize'>
                        {bike.category}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Year</span>
                      <span className='font-medium'>{bike.year}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        Availability
                      </span>
                      <span
                        className={`font-medium ${
                          bike.inStock ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {bike.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
