import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  FileText,
  Settings,
  User,
  Hash,
  Camera,
  Shield,
  Star,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Fixed import - use stock customer vehicle API
import { useGetMyStockVehiclesQuery } from "../../redux-store/services/customer/stockCustomerVehicleApi";
import { useAppSelector } from "@/hooks/redux";
import { selectCustomerAuth } from "@/redux-store/slices/customer/customerAuthSlice";
import cbr from "../../assets/cbr-1000-rrr.jpg";

// Type definitions
interface ServiceBadgeProps {
  title: string;
  subtitle: string;
  gradient: string;
  shadowColor: string;
  icon: ReactNode;
}

export function CustomerBikeInfo() {
  const navigate = useNavigate();
  const { customer, isAuthenticated, firebaseToken } =
    useAppSelector(selectCustomerAuth);

  // Redirect to login if not authenticated
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
  } = useGetMyStockVehiclesQuery(undefined, {
    skip: !isAuthenticated || !firebaseToken, // Skip query if not authenticated
  });

  const ServiceBadge = ({
    title,
    subtitle,
    gradient,
    shadowColor,
    icon,
  }: ServiceBadgeProps) => (
    <div className='relative group'>
      <div
        className={`flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br ${gradient} shadow-xl ${shadowColor} border-2 border-white/20 backdrop-blur-sm transform transition-all duration-300 hover:scale-110 hover:shadow-2xl group-hover:rotate-3`}
      >
        <div className='absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
        <div className='text-white mb-1 transform group-hover:scale-110 transition-transform duration-200'>
          {icon}
        </div>
        <div className='text-[7px] sm:text-[8px] lg:text-[9px] font-bold text-center leading-tight px-1 text-white/95 relative z-10'>
          <div className='tracking-wider'>{title}</div>
          <div className='font-semibold opacity-90'>{subtitle}</div>
        </div>
        <div className='absolute inset-0 rounded-full border-2 border-white/30 scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500'></div>
      </div>
      <div className='absolute -top-1 -right-1 w-2 h-2 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping'></div>
      <div className='absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping animation-delay-200'></div>
    </div>
  );

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
        <span className='ml-2 text-gray-600'>Loading your vehicles...</span>
      </div>
    );
  }

  if (error) {
    const errorMessage =
      (error as any)?.data?.message || "Failed to load vehicle information";
    const isAuthError = (error as any)?.status === 401;

    return (
      <Card className='border-red-200'>
        <CardContent className='p-8 text-center'>
          <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
          <p className='text-red-600 font-semibold mb-2'>
            {isAuthError ? "Authentication Error" : "Error Loading Vehicles"}
          </p>
          <p className='text-gray-600 mb-4'>{errorMessage}</p>
          {isAuthError ? (
            <Button
              onClick={() => navigate("/customer/login")}
              className='bg-red-600 hover:bg-red-700'
            >
              Go to Login
            </Button>
          ) : (
            <Button
              onClick={() => refetch()}
              variant='outline'
              className='border-red-300 hover:bg-red-50'
            >
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!vehiclesData?.data || vehiclesData.data.length === 0) {
    return (
      <Card>
        <CardContent className='p-8 text-center'>
          <div className='mb-4'>
            <Camera className='w-16 h-16 text-gray-300 mx-auto' />
          </div>
          <h3 className='text-xl font-semibold text-gray-900 mb-2'>
            No Vehicles Found
          </h3>
          <p className='text-gray-600 mb-4'>
            You don't have any vehicles registered yet. Contact your dealer to
            add your motorcycle.
          </p>
          <p className='text-sm text-gray-500'>
            Customer ID: {customer?.phoneNumber}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get the first vehicle (or you can loop through all vehicles)
  const vehicle = vehiclesData.data[0];

  return (
    <div className='space-y-6'>
      {/* Vehicle Count Badge */}
      {vehiclesData.data.length > 1 && (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <p className='text-sm text-blue-800'>
            Showing 1 of {vehiclesData.data.length} vehicles.
            <button className='ml-2 font-semibold hover:underline'>
              View all vehicles
            </button>
          </p>
        </div>
      )}

      {/* Main Bike Information Card */}
      <Card>
        <CardHeader className='bg-white border-b'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-2xl text-gray-900'>
                {vehicle.modelName}
              </CardTitle>
              <p className='text-gray-600 mt-1'>Stock ID: {vehicle.stockId}</p>
            </div>
            <Badge
              variant='outline'
              className={`${
                vehicle.isActive
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-gray-50 text-gray-700 border-gray-200"
              }`}
            >
              {vehicle.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Motorcycle Image */}
            <div className='space-y-4'>
              <div className='relative aspect-video bg-gray-100 rounded-lg overflow-hidden'>
                <img
                  src={cbr}
                  alt={vehicle.modelName}
                  className='object-contain w-full h-full'
                />
              </div>
            </div>

            {/* Basic Information */}
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Category
                  </label>
                  <p className='text-lg font-semibold text-gray-900'>
                    {vehicle.category}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Engine CC
                  </label>
                  <p className='text-lg font-semibold text-gray-900'>
                    {vehicle.engineCC}cc
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Color
                  </label>
                  <p className='text-lg font-semibold text-gray-900'>
                    {vehicle.color}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Year
                  </label>
                  <p className='text-lg font-semibold text-gray-900'>
                    {vehicle.yearOfManufacture}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Payment Status
                  </label>
                  <Badge
                    variant='outline'
                    className={`${
                      vehicle.salesInfo?.paymentStatus === "Paid"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }`}
                  >
                    {vehicle.salesInfo?.paymentStatus || "N/A"}
                  </Badge>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Sale Price
                  </label>
                  <p className='text-lg font-semibold text-gray-900'>
                    ₹{vehicle.salesInfo?.salePrice?.toLocaleString() || "N/A"}
                  </p>
                </div>
              </div>

              {/* Service Badges */}
              <div className='flex justify-center gap-3 pt-6'>
                <ServiceBadge
                  title='ANNUAL'
                  subtitle='MAINTENANCE'
                  gradient='from-indigo-500 via-white-500 to-red-500'
                  shadowColor='shadow-indigo-500/25'
                  icon={<Settings className='w-9 h-9' />}
                />
                <ServiceBadge
                  title='THREE YEAR FREE'
                  subtitle='SERVICE'
                  gradient='from-emerald-400 via-teal-500 to-cyan-500'
                  shadowColor='shadow-emerald-500/25'
                  icon={<Shield className='w-9 h-9' />}
                />
                <ServiceBadge
                  title='VALUE ADDED'
                  subtitle='SERVICE'
                  gradient='from-orange-400 via-red-500 to-pink-500'
                  shadowColor='shadow-red-500/25'
                  icon={<Star className='w-9 h-9' />}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Engine & Chassis Information */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Settings className='w-5 h-5 mr-2 text-red-600' />
              Technical Details
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <label className='text-sm font-medium text-gray-500 flex items-center'>
                <Hash className='w-4 h-4 mr-1' />
                Engine Number
              </label>
              <p className='text-lg font-mono text-gray-900 bg-gray-50 p-2 rounded border'>
                {vehicle.engineNumber || "N/A"}
              </p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-500 flex items-center'>
                <Hash className='w-4 h-4 mr-1' />
                Chassis Number
              </label>
              <p className='text-lg font-mono text-gray-900 bg-gray-50 p-2 rounded border'>
                {vehicle.chassisNumber || "N/A"}
              </p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-500'>
                Variant
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                {vehicle.variant || "N/A"}
              </p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-500'>
                Stock Status
              </label>
              <Badge
                variant='outline'
                className={`${
                  vehicle.stockStatus.status === "Sold"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                {vehicle.stockStatus.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Sales Information */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <User className='w-5 h-5 mr-2 text-red-600' />
              Sales Information
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <label className='text-sm font-medium text-gray-500'>
                Sold To
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                {vehicle.salesInfo?.soldTo?.phoneNumber || "N/A"}
              </p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-500'>
                Invoice Number
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                {vehicle.salesInfo?.invoiceNumber || "N/A"}
              </p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-500 flex items-center'>
                <Calendar className='w-4 h-4 mr-1' />
                Sale Date
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                {vehicle.salesInfo?.soldDate
                  ? new Date(vehicle.salesInfo.soldDate).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )
                  : "N/A"}
              </p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-500'>
                Sales Person
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                {vehicle.salesInfo?.salesPerson?.name || "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price Information */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <FileText className='w-5 h-5 mr-2 text-red-600' />
            Price Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div>
              <label className='text-sm font-medium text-gray-500'>
                Ex-Showroom Price
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                ₹{vehicle.priceInfo.exShowroomPrice.toLocaleString()}
              </p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-500'>
                Road Tax
              </label>
              <p className='text-lg font-semibold text-gray-900'>
                ₹{vehicle.priceInfo.roadTax.toLocaleString()}
              </p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-500'>
                On-Road Price
              </label>
              <p className='text-lg font-semibold text-green-700'>
                ₹{vehicle.priceInfo.onRoadPrice.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
