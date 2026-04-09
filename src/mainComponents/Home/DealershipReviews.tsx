import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Star,
  MessageSquare,
  ExternalLink,
  Loader2,
  Quote,
} from "lucide-react";
import {
  googlePlacesService,
  PlaceDetails,
  PlaceReview,
} from "@/lib/googlePlaces";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface ReviewCardProps {
  review: PlaceReview;
  index: number;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, index }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, starIndex) => (
      <Star
        key={starIndex}
        className={`h-4 w-4 ${
          starIndex < rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className='h-full'>
        <CardContent className='pt-6'>
          <div className='flex items-start gap-3 mb-4'>
            <div className='flex-shrink-0'>
              <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center'>
                <Quote className='h-5 w-5 text-red-600' />
              </div>
            </div>
            <div className='flex-1'>
              <h4 className='font-semibold text-gray-900'>
                {review.author_name}
              </h4>
              <div className='flex items-center gap-2 mt-1'>
                <div className='flex items-center'>
                  {renderStars(review.rating)}
                </div>
                <span className='text-sm text-gray-500'>{review.rating}.0</span>
              </div>
            </div>
          </div>

          <p className='text-gray-700 text-sm leading-relaxed mb-3 line-clamp-3'>
            {review.text}
          </p>

          <div className='flex items-center justify-between'>
            <span className='text-xs text-gray-500'>
              {review.relative_time_description}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const DealershipReviews: React.FC = () => {
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default place ID for main dealership (you can make this configurable)
  const mainDealershipPlaceId = "ChIJrTLr-GyuEmsRBfyf1GD8KAE"; // Example: Replace with actual place ID

  useEffect(() => {
    if (googlePlacesService.isConfigured()) {
      fetchPlaceDetails();
    }
  }, []);

  const fetchPlaceDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const details = await googlePlacesService.getPlaceDetails(
        mainDealershipPlaceId,
      );
      if (details) {
        setPlaceDetails(details);
      } else {
        setError("Could not fetch dealership information");
      }
    } catch (err) {
      setError("Failed to load reviews");
      console.error("Error fetching place details:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAverageRating = (reviews: PlaceReview[]) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = (reviews: PlaceReview[]) => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  if (loading) {
    return (
      <section className='py-16 bg-gradient-to-br from-gray-50 to-white'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold mb-4'>Customer Reviews</h2>
            <div className='flex justify-center items-center'>
              <Loader2 className='h-8 w-8 animate-spin text-red-600' />
              <span className='ml-2 text-gray-600'>Loading reviews...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className='py-16 bg-gradient-to-br from-gray-50 to-white'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold mb-4'>Customer Reviews</h2>
            <Card className='max-w-md mx-auto border-red-200 bg-red-50'>
              <CardContent className='pt-6'>
                <p className='text-red-600'>{error}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  const reviews = placeDetails?.reviews || [];
  const averageRating = reviews.length > 0 ? getAverageRating(reviews) : "0";
  const ratingDistribution = getRatingDistribution(reviews);
  const displayedReviews = reviews.slice(0, 6); // Show 6 reviews on home page

  return (
    <section className='py-16 bg-gradient-to-br from-gray-50 to-white'>
      <div className='container mx-auto px-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='text-center mb-12'
        >
          <div className='flex items-center justify-center gap-2 mb-4'>
            <div className='h-1 w-12 bg-red-500 rounded-full' />
            <span className='text-red-600 text-sm font-semibold tracking-[0.2em] uppercase'>
              Testimonials
            </span>
            <div className='h-1 w-12 bg-red-500 rounded-full' />
          </div>
          <h2 className='text-3xl md:text-4xl font-bold tracking-tight mb-4'>
            What Our Customers
            <span className='bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent ml-2'>
              Are Saying
            </span>
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Read authentic reviews from our valued customers about their
            experiences at TsangPool Honda
          </p>
        </motion.div>

        {reviews.length > 0 ? (
          <>
            {/* Rating Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='mb-12'
            >
              <Card className='max-w-4xl mx-auto shadow-lg border-0'>
                <CardContent className='p-8'>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                    {/* Overall Rating */}
                    <div className='text-center'>
                      <div className='text-5xl font-bold text-gray-900 mb-2'>
                        {placeDetails?.rating || averageRating}
                      </div>
                      <div className='flex justify-center items-center gap-1 mb-2'>
                        {Array.from({ length: 5 }, (_, index) => (
                          <Star
                            key={index}
                            className={`h-6 w-6 ${
                              index <
                              (placeDetails?.rating || Number(averageRating))
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className='text-gray-600'>
                        Based on{" "}
                        {placeDetails?.user_ratings_total || reviews.length}{" "}
                        reviews
                      </p>
                    </div>

                    {/* Rating Distribution */}
                    <div className='md:col-span-2 space-y-2'>
                      <h4 className='font-semibold text-gray-900 mb-3'>
                        Rating Distribution
                      </h4>
                      {Object.entries(ratingDistribution)
                        .reverse()
                        .map(([rating, count]) => {
                          const percentage =
                            reviews.length > 0
                              ? (count / reviews.length) * 100
                              : 0;
                          return (
                            <div
                              key={rating}
                              className='flex items-center gap-3'
                            >
                              <span className='text-sm text-gray-600 w-8'>
                                {rating}★
                              </span>
                              <div className='flex-1 bg-gray-200 rounded-full h-3 overflow-hidden'>
                                <div
                                  className='bg-yellow-400 h-full rounded-full transition-all duration-500'
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className='text-sm text-gray-500 w-8 text-right'>
                                {count}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Reviews Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12'>
              {displayedReviews.map((review, index) => (
                <ReviewCard key={index} review={review} index={index} />
              ))}
            </div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className='text-center'
            >
              <Card className='bg-gradient-to-r from-red-50 to-orange-50 border-red-200 max-w-2xl mx-auto'>
                <CardContent className='pt-8 pb-8'>
                  <div className='flex items-center justify-center mb-4'>
                    <MessageSquare className='h-8 w-8 text-red-600' />
                  </div>
                  <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                    Read More Customer Stories
                  </h3>
                  <p className='text-gray-600 mb-6'>
                    Explore detailed reviews and experiences from our satisfied
                    customers
                  </p>
                  <div className='flex gap-3 justify-center'>
                    <Link to='/dealership-reviews'>
                      <Button className='bg-red-600 hover:bg-red-700'>
                        <MessageSquare className='h-4 w-4 mr-2' />
                        View All Reviews
                      </Button>
                    </Link>
                    <Button variant='outline'>
                      <ExternalLink className='h-4 w-4 mr-2' />
                      Write a Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          /* No Reviews State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className='text-center'
          >
            <div className='bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6'>
              <MessageSquare className='h-12 w-12 text-gray-400' />
            </div>
            <h3 className='text-xl font-semibold mb-2'>No Reviews Available</h3>
            <p className='text-gray-600 mb-6'>
              Be the first to share your experience at TsangPool Honda
            </p>
            <Button variant='outline'>
              <ExternalLink className='h-4 w-4 mr-2' />
              Write a Review
            </Button>
          </motion.div>
        )}

        {/* API Configuration Warning */}
        {!googlePlacesService.isConfigured() && (
          <Card className='mt-8 border-yellow-200 bg-yellow-50 max-w-2xl mx-auto'>
            <CardContent className='pt-6'>
              <p className='text-yellow-800'>
                Google Places API is not configured. Please add your API key to
                display customer reviews.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default DealershipReviews;
