import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Camera,
  AlertCircle,
  RefreshCw,
  Bike,
  Gauge,
  Zap,
  Palette,
  CreditCard,
  PlusCircle,
  CalendarDays,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetMyVehiclesQuery } from "../../redux-store/services/customer/customerVehicleApi";
import { useAppSelector } from "@/hooks/redux";
import { selectCustomerAuth } from "@/redux-store/slices/customer/customerAuthSlice";

// Helper to get the primary image from different possible sources
const getBikeImage = (vehicle: any) => {
  // 1. primaryBikeImage (populated virtual)
  if (vehicle.primaryBikeImage?.imageUrl) {
    return {
      src: vehicle.primaryBikeImage.imageUrl,
      alt:
        vehicle.primaryBikeImage.caption ||
        vehicle.bike?.modelName ||
        "Vehicle",
    };
  }
  // 2. bikeImages array (populated virtual)
  if (vehicle.bikeImages?.length > 0) {
    const primary = vehicle.bikeImages.find((img: any) => img.isPrimary);
    return {
      src: primary?.imageUrl || vehicle.bikeImages[0].imageUrl,
      alt:
        primary?.caption ||
        vehicle.bikeImages[0].caption ||
        vehicle.bike?.modelName ||
        "Vehicle",
    };
  }
  // 3. bike.images (attached via lean)
  if (vehicle.bike?.images?.length > 0) {
    const primary = vehicle.bike.images.find((img: any) => img.isPrimary);
    return {
      src: primary?.src || vehicle.bike.images[0].src,
      alt:
        primary?.alt ||
        vehicle.bike.images[0].alt ||
        vehicle.bike?.modelName ||
        "Vehicle",
    };
  }
  return null;
};

// Skeleton card component for loading state
const VehicleCardSkeleton = () => (
  <div className='bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-pulse'>
    <div className='relative h-48 sm:h-56 bg-gray-200' />
    <div className='p-5 space-y-4'>
      <div className='space-y-2'>
        <div className='h-6 bg-gray-200 rounded-lg w-3/4' />
        <div className='h-4 bg-gray-200 rounded-lg w-1/4' />
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1'>
          <div className='h-3 bg-gray-200 rounded w-1/2' />
          <div className='h-4 bg-gray-200 rounded w-3/4' />
        </div>
        <div className='space-y-1'>
          <div className='h-3 bg-gray-200 rounded w-1/2' />
          <div className='h-4 bg-gray-200 rounded w-3/4' />
        </div>
        <div className='space-y-1'>
          <div className='h-3 bg-gray-200 rounded w-1/2' />
          <div className='h-4 bg-gray-200 rounded w-3/4' />
        </div>
        <div className='space-y-1'>
          <div className='h-3 bg-gray-200 rounded w-1/2' />
          <div className='h-4 bg-gray-200 rounded w-3/4' />
        </div>
      </div>
      <div className='border-t border-gray-100 pt-4 flex gap-3'>
        <div className='h-10 bg-gray-200 rounded-lg flex-1' />
        <div className='h-10 bg-gray-200 rounded-lg flex-1' />
      </div>
    </div>
  </div>
);

const CustomerBikeInfo = () => {
  const navigate = useNavigate();
  const { customer, isAuthenticated, firebaseToken } =
    useAppSelector(selectCustomerAuth);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !customer || !firebaseToken) {
      navigate("/customer/login", { replace: true });
    }
  }, [isAuthenticated, customer, firebaseToken, navigate]);

  const {
    data: vehiclesData,
    isLoading,
    error,
    refetch,
  } = useGetMyVehiclesQuery(undefined, {
    skip: !isAuthenticated || !firebaseToken,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleAddVehicle = () => {
    navigate("/customer/vehicle/info");
  };

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10'>
          {/* Header Skeleton */}
          <div className='bg-white rounded-2xl shadow-sm p-5 mb-8 border border-gray-100'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gray-200 rounded-xl animate-pulse' />
                <div>
                  <div className='h-6 bg-gray-200 rounded-lg w-32 animate-pulse' />
                  <div className='h-4 bg-gray-200 rounded-lg w-24 mt-1 animate-pulse' />
                </div>
              </div>
              <div className='flex gap-3'>
                <div className='h-10 w-24 bg-gray-200 rounded-lg animate-pulse' />
                <div className='h-10 w-28 bg-gray-200 rounded-lg animate-pulse' />
              </div>
            </div>
          </div>
          {/* Grid Skeleton */}
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
            {[1, 2, 3].map((i) => (
              <VehicleCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4'>
        <div className='max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100'>
          <div className='bg-gradient-to-r from-red-50 to-red-100 p-6 text-center'>
            <div className='w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-4'>
              <AlertCircle className='w-8 h-8 text-red-600' />
            </div>
            <h3 className='text-xl font-bold text-gray-900 mb-2'>
              Oops! Something went wrong
            </h3>
            <p className='text-gray-600 text-sm'>
              We couldn't load your garage. Please check your connection and try
              again.
            </p>
          </div>
          <div className='p-6 flex justify-center'>
            <Button
              onClick={() => refetch()}
              className='bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all'
            >
              <RefreshCw className='w-4 h-4 mr-2' />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No vehicles state
  if (!vehiclesData?.data?.length) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4'>
        <div className='max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 text-center'>
          <div className='bg-gradient-to-br from-blue-50 to-indigo-50 p-8'>
            <div className='w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg'>
              <Bike className='w-12 h-12 text-blue-600' />
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Your Garage is Empty
            </h2>
            <p className='text-gray-600 leading-relaxed mb-6'>
              No vehicles have been assigned to your account yet. Get started by
              adding your first ride.
            </p>
            <Button
              onClick={handleAddVehicle}
              className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all'
            >
              <PlusCircle className='w-4 h-4 mr-2' />
              Add Your First Vehicle
            </Button>
          </div>
          <div className='bg-gray-50 px-6 py-4 border-t border-gray-100'>
            <p className='text-xs text-gray-500'>
              Need help? Contact our support team.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const vehicles = vehiclesData.data;
  const activeCount = vehicles.filter((v: any) => v.isActive).length;

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10'>
        {/* Header Section - Modern Redesign */}
        <div className='mb-8'>
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
            <div className='p-5 sm:p-6'>
              <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5'>
                {/* Left side - Title & Stats */}
                <div className='flex items-start gap-4'>
                  <div className='hidden sm:flex w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl items-center justify-center shadow-md'>
                    <Bike className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <h1 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                      My Garage
                    </h1>
                    <div className='flex flex-wrap items-center gap-3 mt-1'>
                      <p className='text-gray-500 text-sm'>
                        {vehicles.length} vehicle
                        {vehicles.length !== 1 ? "s" : ""} registered
                      </p>
                      {activeCount > 0 && (
                        <Badge
                          variant='outline'
                          className='bg-green-50 text-green-700 border-green-200 text-xs'
                        >
                          <span className='inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5' />
                          {activeCount} Active
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side - Action Buttons */}
                <div className='flex flex-wrap items-center gap-3'>
                  <Button
                    onClick={handleRefresh}
                    variant='outline'
                    size='default'
                    disabled={isRefreshing}
                    className='border-gray-300 hover:bg-gray-50 text-gray-700 shadow-sm'
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Quick Stats Row */}
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-100'>
                <div className='flex items-center gap-2'>
                  <div className='p-1.5 bg-blue-50 rounded-lg'>
                    <Bike className='w-4 h-4 text-blue-600' />
                  </div>
                  <div>
                    <p className='text-xs text-gray-500'>Total Bikes</p>
                    <p className='text-sm font-semibold text-gray-900'>
                      {vehicles.length}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='p-1.5 bg-green-50 rounded-lg'>
                    <CalendarDays className='w-4 h-4 text-green-600' />
                  </div>
                  <div>
                    <p className='text-xs text-gray-500'>Active</p>
                    <p className='text-sm font-semibold text-gray-900'>
                      {activeCount}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='p-1.5 bg-purple-50 rounded-lg'>
                    <Gauge className='w-4 h-4 text-purple-600' />
                  </div>
                  <div>
                    <p className='text-xs text-gray-500'>Avg. Engine</p>
                    <p className='text-sm font-semibold text-gray-900'>
                      {Math.round(
                        vehicles.reduce(
                          (acc: number, v: any) =>
                            acc + (v.bike?.engineSize || 0),
                          0,
                        ) / vehicles.length,
                      ) || "—"}{" "}
                      cc
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='p-1.5 bg-amber-50 rounded-lg'>
                    <Zap className='w-4 h-4 text-amber-600' />
                  </div>
                  <div>
                    <p className='text-xs text-gray-500'>Avg. Power</p>
                    <p className='text-sm font-semibold text-gray-900'>
                      {Math.round(
                        vehicles.reduce(
                          (acc: number, v: any) => acc + (v.bike?.power || 0),
                          0,
                        ) / vehicles.length,
                      ) || "—"}{" "}
                      HP
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicles Grid - Redesigned Cards */}
        <div className='max-w-7xl grid grid-cols-1 xl:grid-cols-1 gap-6 lg:gap-7'>
          {vehicles.map((vehicle) => {
            const image = getBikeImage(vehicle);
            const categoryLabel =
              vehicle.bike?.mainCategory === "scooter"
                ? "Scooter"
                : "Motorcycle";
            const categoryColor =
              vehicle.bike?.mainCategory === "scooter"
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : "bg-blue-100 text-blue-700 border-blue-200";

            return (
              <div
                key={vehicle._id}
                className='group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200'
              >
                {/* Image Container */}
                <div className='relative h-82 sm:h-96 lg:h-160 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200'>
                  {image ? (
                    <img
                      src={image.src}
                      alt={image.alt}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out'
                    />
                  ) : (
                    <div className='w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200'>
                      <Camera className='w-10 h-10 text-gray-400 mb-2' />
                      <span className='text-xs text-gray-500'>No Image</span>
                    </div>
                  )}

                  {/* Overlay gradient on hover */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

                  {/* Status Badge */}
                  <div className='absolute top-3 right-3'>
                    <Badge
                      variant={vehicle.isActive ? "default" : "secondary"}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium shadow-md ${
                        vehicle.isActive
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-none"
                          : "bg-gray-500/90 text-white border-none backdrop-blur-sm"
                      }`}
                    >
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                          vehicle.isActive ? "bg-white" : "bg-gray-300"
                        }`}
                      />
                      {vehicle.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Category Badge */}
                  <div className='absolute bottom-3 left-3'>
                    <div
                      className={`${categoryColor} backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-sm border text-xs font-medium flex items-center gap-1`}
                    >
                      <Bike className='w-3 h-3' />
                      <span>{categoryLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className='p-5 space-y-4'>
                  {/* Title & Year */}
                  <div>
                    <h3 className='text-xl font-bold text-gray-900 leading-tight mb-1 line-clamp-1'>
                      {vehicle.bike?.modelName || "Unknown Model"}
                    </h3>
                    {vehicle.bike?.year && (
                      <div className='flex items-center gap-1 text-gray-500 text-sm'>
                        <CalendarDays className='w-3.5 h-3.5' />
                        <span>{vehicle.bike.year} Model</span>
                      </div>
                    )}
                  </div>

                  {/* Specs Grid - Enhanced */}
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2'>
                      <div className='p-1.5 bg-blue-100 rounded-lg'>
                        <Gauge className='w-3.5 h-3.5 text-blue-600' />
                      </div>
                      <div>
                        <p className='text-[10px] text-gray-500 uppercase tracking-wide'>
                          Engine
                        </p>
                        <p className='text-sm font-semibold text-gray-800'>
                          {vehicle.bike?.engineSize || "—"}{" "}
                          <span className='text-xs font-normal'>cc</span>
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2'>
                      <div className='p-1.5 bg-amber-100 rounded-lg'>
                        <Zap className='w-3.5 h-3.5 text-amber-600' />
                      </div>
                      <div>
                        <p className='text-[10px] text-gray-500 uppercase tracking-wide'>
                          Power
                        </p>
                        <p className='text-sm font-semibold text-gray-800'>
                          {vehicle.bike?.power || "—"}{" "}
                          <span className='text-xs font-normal'>HP</span>
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2'>
                      <div className='p-1.5 bg-purple-100 rounded-lg'>
                        <Palette className='w-3.5 h-3.5 text-purple-600' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-[10px] text-gray-500 uppercase tracking-wide'>
                          Colors
                        </p>
                        <p className='text-sm font-semibold text-gray-800 truncate'>
                          {vehicle.bike?.colors?.length
                            ? vehicle.bike.colors.slice(0, 2).join(", ") +
                              (vehicle.bike.colors.length > 2 ? "..." : "")
                            : "—"}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2'>
                      <div className='p-1.5 bg-green-100 rounded-lg'>
                        <CreditCard className='w-3.5 h-3.5 text-green-600' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-[10px] text-gray-500 uppercase tracking-wide'>
                          Plate
                        </p>
                        <p className='text-sm font-semibold text-gray-800 truncate'>
                          {vehicle.numberPlate || "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className='border-t border-gray-100 pt-3' />

                  {/* Action Buttons - Enhanced */}
                  <div className='flex gap-3'>
                    <Button
                      onClick={() =>
                        navigate(`/customer/vehicle/${vehicle._id}`)
                      }
                      variant='outline'
                      className='flex-1 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl shadow-sm'
                    >
                      <FileText className='w-4 h-4 mr-2' />
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomerBikeInfo;
