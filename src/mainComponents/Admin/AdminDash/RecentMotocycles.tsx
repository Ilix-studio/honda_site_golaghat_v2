import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  useGetBikesQuery,
  useDeleteBikeMutation,
} from "@/redux-store/services/BikeSystemApi/bikeApi";
import {
  Zap,
  Calendar,
  Star,
  AlertTriangle,
  Eye,
  Bike,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";

const RecentMotorcycles = () => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch bikes and scooters with recent filters
  const {
    data: bikesData,
    isLoading: bikesLoading,
    isError: bikesError,
  } = useGetBikesQuery({
    mainCategory: "bike",
    limit: 5,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const {
    data: scootiesData,
    isLoading: scootiesLoading,
    isError: scootiesError,
  } = useGetBikesQuery({
    mainCategory: "scooter",
    limit: 5,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Delete mutation
  const [deleteBike] = useDeleteBikeMutation();

  const handleDelete = async (vehicleId: string, vehicleName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${vehicleName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(vehicleId);

    try {
      await deleteBike(vehicleId).unwrap();
      toast.success(`${vehicleName} deleted successfully`);
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error?.data?.error || "Failed to delete vehicle");
    } finally {
      setDeletingId(null);
    }
  };

  const LoadingSkeleton = () => (
    <div className='space-y-3'>
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className='flex items-center space-x-4'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className='w-16 h-16 bg-gray-200 animate-pulse rounded-lg'></div>
          <div className='flex-1 space-y-2'>
            <div className='h-4 bg-gray-200 animate-pulse rounded w-3/4'></div>
            <div className='h-3 bg-gray-200 animate-pulse rounded w-1/2'></div>
            <div className='h-3 bg-gray-200 animate-pulse rounded w-1/4'></div>
          </div>
          <div className='space-y-2'>
            <div className='h-8 w-16 bg-gray-200 animate-pulse rounded'></div>
            <div className='h-6 w-12 bg-gray-200 animate-pulse rounded'></div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const formatPrice = (priceBreakdown: any) => {
    if (priceBreakdown?.onRoadPrice) {
      return `₹${priceBreakdown.onRoadPrice.toLocaleString()}`;
    } else if (priceBreakdown?.exShowroomPrice) {
      return `₹${priceBreakdown.exShowroomPrice.toLocaleString()}`;
    }
    return "Price on request";
  };

  const getStockStatus = (stockAvailable: number) => {
    if (stockAvailable === 0) {
      return { text: "Out of Stock", variant: "destructive" as const };
    } else if (stockAvailable <= 5) {
      return { text: "Low Stock", variant: "secondary" as const };
    }
    return { text: "In Stock", variant: "default" as const };
  };

  interface VehicleListProps {
    vehicles: { data: { bikes: any[] } } | undefined;
    isLoading: boolean;
    isError: boolean;
    vehicleType: string;
    icon: React.ComponentType<{ className?: string }>;
    editPath: string;
    addPath: string;
    imagePath: string;
  }

  const VehicleList = ({
    vehicles,
    isLoading,
    isError,
    vehicleType,
    icon: Icon,
    editPath,
    imagePath,
  }: VehicleListProps) => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }

    if (isError) {
      return (
        <div className='text-center py-6 text-red-500'>
          <AlertTriangle className='h-8 w-8 mx-auto mb-2' />
          <p>Error loading {vehicleType.toLowerCase()}s</p>
        </div>
      );
    }

    if (!vehicles?.data?.bikes?.length) {
      return (
        <div className='text-center py-8'>
          <Icon className='h-12 w-12 mx-auto text-gray-400 mb-3' />
          <p className='text-gray-500 mb-4'>
            No {vehicleType.toLowerCase()}s available
          </p>
          <Link to='/admin/addbikes'>
            <Button size='sm' className='bg-red-600 hover:bg-red-700'>
              Add First {vehicleType}
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className='space-y-4'>
        {vehicles.data.bikes.map((vehicle, index) => {
          const stockStatus = getStockStatus(vehicle.stockAvailable);
          const isDeleting = deletingId === vehicle._id;

          return (
            <motion.div
              key={vehicle._id}
              className='flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-200 bg-white'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className='flex items-center space-x-4'>
                <div className='w-16 h-16 bg-gradient-to-br from-red-50 to-red-100 rounded-lg flex items-center justify-center'>
                  <Icon className='h-8 w-8 text-red-600' />
                </div>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1'>
                    <h3 className='font-semibold text-gray-900'>
                      {vehicle.modelName}
                    </h3>
                    {vehicle.isNewModel && (
                      <Badge
                        variant='secondary'
                        className='text-xs bg-yellow-100 text-yellow-800'
                      >
                        <Star className='h-3 w-3 mr-1' />
                        New
                      </Badge>
                    )}
                  </div>
                  <div className='flex items-center gap-3 text-sm text-gray-600'>
                    <span className='capitalize'>{vehicle.category}</span>
                    <span>•</span>
                    <span className='flex items-center gap-1'>
                      <Calendar className='h-3 w-3' />
                      {vehicle.year}
                    </span>
                    <span>•</span>
                    <span>{vehicle.engineSize}</span>
                  </div>
                  <div className='flex items-center gap-2 mt-1'>
                    <span className='font-medium text-red-600'>
                      {formatPrice(vehicle.priceBreakdown)}
                    </span>
                    <Badge {...stockStatus}>{stockStatus.text}</Badge>
                  </div>
                </div>
              </div>

              <div className='flex items-center space-x-2'>
                <span className='text-sm text-gray-500'>
                  Stock: {vehicle.stockAvailable}
                </span>
                <Link to={`${imagePath}/${vehicle._id}`}>
                  <Button variant='outline' size='sm'>
                    <Eye className='h-4 w-4 mr-1' />
                    Images
                  </Button>
                </Link>
                <Link to={`${editPath}/${vehicle._id}`}>
                  <Button variant='outline' size='sm'>
                    Edit
                  </Button>
                </Link>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleDelete(vehicle._id, vehicle.modelName)}
                  disabled={isDeleting}
                  className='text-red-600 hover:text-red-700 hover:bg-red-50'
                >
                  {isDeleting ? (
                    <div className='h-4 w-4 animate-spin border-2 border-red-600 border-t-transparent rounded-full mr-1' />
                  ) : (
                    <Trash2 className='h-4 w-4 mr-1' />
                  )}
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </motion.div>
          );
        })}

        {vehicles.data.bikes.length >= 5 && (
          <div className='text-center pt-4'>
            <Link
              to={vehicleType === "Bike" ? "/admin/bikes" : "/admin/scooters"}
            >
              <Button variant='ghost' size='sm'>
                View All {vehicleType}s →
              </Button>
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className='mt-6'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Bike className='h-5 w-5 text-red-600' />
              Recent Vehicles
            </CardTitle>
            <CardDescription>
              Recently added vehicles to your Honda dealership inventory
            </CardDescription>
          </div>
          <div className='flex gap-2'>
            <Link to='/admin/addbikes'>
              <Button size='sm' className='bg-red-600 hover:bg-red-700'>
                Add Vehicle
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue='bikes' className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='bikes' className='flex items-center gap-2'>
              Motorcycles
              {bikesData?.data?.pagination?.total && (
                <Badge variant='secondary' className='ml-1 text-xs'>
                  {bikesData.data.pagination.total}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value='scooties' className='flex items-center gap-2'>
              Scooters
              {scootiesData?.data?.pagination?.total && (
                <Badge variant='secondary' className='ml-1 text-xs'>
                  {scootiesData.data.pagination.total}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value='bikes' className='mt-6'>
            <VehicleList
              vehicles={bikesData}
              isLoading={bikesLoading}
              isError={bikesError}
              vehicleType='Bike'
              icon={Bike}
              editPath='/admin/addbikes/edit'
              addPath='/admin/addbikes'
              imagePath='/admin/bikeimages'
            />
          </TabsContent>

          <TabsContent value='scooties' className='mt-6'>
            <VehicleList
              vehicles={scootiesData}
              isLoading={scootiesLoading}
              isError={scootiesError}
              vehicleType='Scooty'
              icon={Zap}
              editPath='/admin/addbikes/edit'
              addPath='/admin/addscooties'
              imagePath='/admin/scootypimages'
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RecentMotorcycles;
