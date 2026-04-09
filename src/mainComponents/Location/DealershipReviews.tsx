import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Clock,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  googlePlacesService,
  PlaceDetails,
  PlaceReview,
} from "@/lib/googlePlaces";

interface ReviewCardProps {
  review: PlaceReview;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <Card className='hover:shadow-md transition-shadow'>
      <CardContent className='pt-6'>
        <div className='flex items-start justify-between mb-3'>
          <div>
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
          <span className='text-xs text-gray-500 flex items-center gap-1'>
            <Clock className='h-3 w-3' />
            {review.relative_time_description}
          </span>
        </div>

        <p className='text-gray-700 text-sm leading-relaxed mb-3'>
          {review.text}
        </p>

        <div className='flex items-center justify-between'>
          <Button
            variant='ghost'
            size='sm'
            className='text-gray-500 hover:text-gray-700'
          >
            <ThumbsUp className='h-3 w-3 mr-1' />
            Helpful
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export interface DealershipReviewsProps {
  placeId?: string;
  dealershipName?: string;
}

const DealershipReviews: React.FC<DealershipReviewsProps> = ({
  placeId,
  dealershipName = "TsangPool Honda",
}) => {
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    if (placeId && googlePlacesService.isConfigured()) {
      fetchPlaceDetails();
    }
  }, [placeId]);

  const fetchPlaceDetails = async () => {
    if (!placeId) return;

    setLoading(true);
    setError(null);

    try {
      const details = await googlePlacesService.getPlaceDetails(placeId);
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

  const getRatingDistribution = (reviews: PlaceReview[]) => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const getAverageRating = (reviews: PlaceReview[]) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center py-12'>
        <Loader2 className='h-8 w-8 animate-spin text-red-600' />
        <span className='ml-2 text-gray-600'>Loading reviews...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className='border-red-200 bg-red-50'>
        <CardContent className='pt-6'>
          <p className='text-red-600'>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!placeDetails) {
    return (
      <Card className='border-yellow-200 bg-yellow-50'>
        <CardContent className='pt-6'>
          <p className='text-yellow-800'>
            Google Places API is not configured or no place ID provided.
          </p>
        </CardContent>
      </Card>
    );
  }

  const reviews = placeDetails.reviews || [];
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 5);
  const ratingDistribution = getRatingDistribution(reviews);
  const averageRating = getAverageRating(reviews);

  return (
    <div className='space-y-6'>
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <MessageSquare className='h-5 w-5' />
            Customer Reviews
          </CardTitle>
          <CardDescription>
            See what our customers are saying about {dealershipName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Overall Rating */}
            <div className='text-center'>
              <div className='text-4xl font-bold text-gray-900 mb-2'>
                {placeDetails.rating || averageRating}
              </div>
              <div className='flex justify-center items-center gap-1 mb-2'>
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    className={`h-5 w-5 ${
                      index < (placeDetails.rating || Number(averageRating))
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className='text-gray-600'>
                Based on {placeDetails.user_ratings_total || reviews.length}{" "}
                reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className='space-y-2'>
              {Object.entries(ratingDistribution)
                .reverse()
                .map(([rating, count]) => {
                  const percentage =
                    reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={rating} className='flex items-center gap-2'>
                      <span className='text-sm text-gray-600 w-8'>
                        {rating}★
                      </span>
                      <div className='flex-1 bg-gray-200 rounded-full h-2 overflow-hidden'>
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

      {/* Reviews List */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-xl font-semibold'>
            Customer Reviews ({reviews.length})
          </h3>
          {reviews.length > 5 && (
            <Button
              variant='outline'
              onClick={() => setShowAllReviews(!showAllReviews)}
            >
              {showAllReviews ? "Show Less" : `Show All (${reviews.length})`}
            </Button>
          )}
        </div>

        {displayedReviews.length === 0 ? (
          <Card>
            <CardContent className='pt-6 text-center'>
              <MessageSquare className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-600'>No reviews available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-4'>
            {displayedReviews.map((review, index) => (
              <ReviewCard key={index} review={review} />
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <Card className='bg-gradient-to-r from-red-50 to-orange-50 border-red-200'>
        <CardContent className='pt-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='font-semibold text-gray-900 mb-1'>
                Share Your Experience
              </h4>
              <p className='text-sm text-gray-600'>
                Help others by sharing your experience at {dealershipName}
              </p>
            </div>
            <Button className='bg-red-600 hover:bg-red-700'>
              <ExternalLink className='h-4 w-4 mr-2' />
              Write a Review
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DealershipReviews;
