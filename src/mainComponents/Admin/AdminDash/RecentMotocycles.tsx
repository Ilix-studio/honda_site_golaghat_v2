import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetBikesQuery,
  useDeleteBikeMutation,
} from "@/redux-store/services/BikeSystemApi/bikeApi";
import { useGetBikeImagesQuery } from "@/redux-store/services/BikeSystemApi/bikeImageApi";
import {
  Zap,
  Calendar,
  Star,
  AlertTriangle,
  Eye,
  Bike,
  Trash2,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";

// ─── helpers ────────────────────────────────────────────────────────────────
const formatPrice = (priceBreakdown: any): string => {
  if (priceBreakdown?.onRoadPrice)
    return `₹${priceBreakdown.onRoadPrice.toLocaleString("en-IN")}`;
  if (priceBreakdown?.exShowroomPrice)
    return `₹${priceBreakdown.exShowroomPrice.toLocaleString("en-IN")}`;
  return "Price on request";
};

const getStockStatus = (stock: number) => {
  if (stock === 0)
    return { text: "Out of Stock", color: "bg-red-100 text-red-700" };
  if (stock <= 5)
    return { text: "Low Stock", color: "bg-amber-100 text-amber-700" };
  return { text: "In Stock", color: "bg-emerald-100 text-emerald-700" };
};

// ─── skeleton ────────────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className='rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden'
      >
        <div className='w-full aspect-[4/3] bg-gray-200 animate-pulse' />
        <div className='p-3 space-y-2'>
          <div className='h-4 bg-gray-200 animate-pulse rounded w-3/4' />
          <div className='h-3 bg-gray-200 animate-pulse rounded w-1/2' />
          <div className='h-3 bg-gray-200 animate-pulse rounded w-2/3' />
        </div>
      </div>
    ))}
  </div>
);

// ─── vehicle row ─────────────────────────────────────────────────────────────
interface VehicleRowProps {
  vehicle: any;
  index: number;
  icon: React.ComponentType<{ className?: string }>;
  editPath: string;
  imagePath: string;
  isDeleting: boolean;
  onDelete: (id: string, name: string) => void;
}

const VehicleRow = ({
  vehicle,
  index,
  icon: Icon,
  editPath,
  imagePath,
  isDeleting,
  onDelete,
}: VehicleRowProps) => {
  const stock = getStockStatus(vehicle.stockAvailable);

  const { data: imagesData, isLoading: imageLoading } = useGetBikeImagesQuery(
    vehicle._id,
  );
  const images = imagesData?.data?.images ?? [];
  const primaryImage = images.find((img) => img.isPrimary) ?? images[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: "easeOut" }}
      className='group relative flex flex-col rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden'
    >
      {/* image */}
      <div className='relative w-full aspect-[4/3] bg-gradient-to-br from-red-50 to-orange-50 overflow-hidden'>
        {imageLoading ? (
          <div className='w-full h-full bg-gray-100 animate-pulse' />
        ) : primaryImage ? (
          <img
            src={primaryImage.src}
            alt={primaryImage.alt || vehicle.modelName}
            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center'>
            <Icon className='h-10 w-10 text-red-300' />
          </div>
        )}

        {/* badges overlaid on image */}
        <span
          className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm ${stock.color}`}
        >
          {stock.text}
        </span>
        {vehicle.isNewModel && (
          <span className='absolute top-2 right-2 inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 shadow-sm'>
            <Star className='w-2.5 h-2.5' />
            New
          </span>
        )}
      </div>

      {/* info */}
      <div className='flex-1 flex flex-col gap-1.5 p-3'>
        <h3 className='font-bold text-gray-900 text-sm truncate'>
          {vehicle.modelName}
        </h3>

        <div className='flex items-center gap-1.5 text-xs text-gray-400 flex-wrap'>
          <span className='capitalize'>{vehicle.category}</span>
          <span>·</span>
          <span className='flex items-center gap-1'>
            <Calendar className='w-3 h-3' />
            {vehicle.year}
          </span>
          {vehicle.engineSize && (
            <>
              <span>·</span>
              <span>{vehicle.engineSize}</span>
            </>
          )}
        </div>

        <span className='text-sm font-black text-red-600'>
          {formatPrice(vehicle.priceBreakdown)}
        </span>
      </div>

      {/* actions */}
      <div className='flex items-center gap-1 px-2 py-2 border-t border-gray-100 bg-gray-50/50'>
        <Link to={`${imagePath}/${vehicle._id}`} className='flex-1'>
          <Button
            variant='ghost'
            size='sm'
            className='w-full h-8 px-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          >
            <Eye className='h-3.5 w-3.5 mr-1' />
            <span className='text-xs'>Images</span>
          </Button>
        </Link>
        <Link to={`${editPath}/${vehicle._id}`} className='flex-1'>
          <Button
            variant='ghost'
            size='sm'
            className='w-full h-8 px-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          >
            <span className='text-xs'>Edit</span>
          </Button>
        </Link>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => onDelete(vehicle._id, vehicle.modelName)}
          disabled={isDeleting}
          className='h-8 px-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0'
        >
          {isDeleting ? (
            <div className='h-3.5 w-3.5 animate-spin border-2 border-red-500 border-t-transparent rounded-full' />
          ) : (
            <Trash2 className='h-3.5 w-3.5' />
          )}
        </Button>
      </div>
    </motion.div>
  );
};

// ─── vehicle list ─────────────────────────────────────────────────────────────
interface VehicleListProps {
  vehicles:
    | { data: { bikes: any[]; pagination?: { total: number } } }
    | undefined;
  isLoading: boolean;
  isError: boolean;
  vehicleType: string;
  icon: React.ComponentType<{ className?: string }>;
  editPath: string;
  addPath: string;
  imagePath: string;
  deletingId: string | null;
  onDelete: (id: string, name: string) => void;
}

const VehicleList = ({
  vehicles,
  isLoading,
  isError,
  vehicleType,
  icon: Icon,
  imagePath,
  editPath,
  deletingId,
  onDelete,
}: VehicleListProps) => {
  if (isLoading) return <LoadingSkeleton />;

  if (isError)
    return (
      <div className='flex flex-col items-center justify-center py-12 text-red-500'>
        <AlertTriangle className='h-8 w-8 mb-2' />
        <p className='text-sm'>Error loading {vehicleType.toLowerCase()}s</p>
      </div>
    );

  if (!vehicles?.data?.bikes?.length)
    return (
      <div className='flex flex-col items-center justify-center py-12'>
        <div className='w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4'>
          <Icon className='h-8 w-8 text-gray-400' />
        </div>
        <p className='text-sm text-gray-500 mb-4'>
          No {vehicleType.toLowerCase()}s added yet
        </p>
        <Link to='/bikes/add'>
          <Button size='sm' className='bg-red-600 hover:bg-red-700 rounded-xl'>
            <Plus className='h-3.5 w-3.5 mr-1.5' />
            Add First {vehicleType}
          </Button>
        </Link>
      </div>
    );

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
        {vehicles.data.bikes.map((vehicle, index) => (
          <VehicleRow
            key={vehicle._id}
            vehicle={vehicle}
            index={index}
            icon={Icon}
            editPath={editPath}
            imagePath={imagePath}
            isDeleting={deletingId === vehicle._id}
            onDelete={onDelete}
          />
        ))}
      </div>

      {vehicles.data.bikes.length >= 5 && (
        <div className='pt-2 flex justify-center'>
          <Link to='/viewAll'>
            <Button
              variant='ghost'
              size='sm'
              className='text-xs text-gray-500 hover:text-gray-900 rounded-xl'
            >
              View all
              <ArrowRight className='h-3 w-3 ml-1' />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

// ─── main ─────────────────────────────────────────────────────────────────────
const RecentMotorcycles = () => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const [deleteBike] = useDeleteBikeMutation();

  const handleDelete = async (vehicleId: string, vehicleName: string) => {
    if (!window.confirm(`Delete "${vehicleName}"? This cannot be undone.`))
      return;
    setDeletingId(vehicleId);
    try {
      await deleteBike(vehicleId).unwrap();
      toast.success(`${vehicleName} deleted`);
    } catch (error: any) {
      toast.error(error?.data?.error ?? "Failed to delete vehicle");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className='rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden'>
      {/* header */}
      <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
        <div className='flex items-center gap-3'>
          <div className='w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center'>
            <Bike className='h-4.5 w-4.5 text-red-600' />
          </div>
          <div>
            <h3 className='text-sm font-bold text-gray-900'>Recent Vehicles</h3>
            <p className='text-xs text-gray-400'>Honda dealership inventory</p>
          </div>
        </div>
        <Link to='/bikes/add'>
          <Button
            size='sm'
            className='bg-blue-800 text-white hover:bg-blue-900 hover:text-white rounded-xl h-8 text-xs cursor-pointer'
          >
            <Plus className='h-3.5 w-3.5 mr-1.5' />
            Add Vehicle
          </Button>
        </Link>
      </div>

      {/* tabs */}
      <div className='p-4'>
        <Tabs defaultValue='bikes'>
          <TabsList className='w-full grid grid-cols-2 rounded-xl bg-gray-100 p-1 h-auto mb-4'>
            <TabsTrigger
              value='bikes'
              className='rounded-lg py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2'
            >
              <Bike className='h-3.5 w-3.5' />
              Motorcycles
              {bikesData?.data?.pagination?.total != null && (
                <span className='ml-1 px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 text-[10px] font-bold'>
                  {bikesData.data.pagination.total}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value='scooties'
              className='rounded-lg py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2'
            >
              <Zap className='h-3.5 w-3.5' />
              Scooters
              {scootiesData?.data?.pagination?.total != null && (
                <span className='ml-1 px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 text-[10px] font-bold'>
                  {scootiesData.data.pagination.total}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value='bikes' className='mt-0'>
            <VehicleList
              vehicles={bikesData}
              isLoading={bikesLoading}
              isError={bikesError}
              vehicleType='Bike'
              icon={Bike}
              editPath='/bikes/edit'
              addPath='/bikes/add'
              imagePath='/bikeimages'
              deletingId={deletingId}
              onDelete={handleDelete}
            />
          </TabsContent>

          <TabsContent value='scooties' className='mt-0'>
            <VehicleList
              vehicles={scootiesData}
              isLoading={scootiesLoading}
              isError={scootiesError}
              vehicleType='Scooty'
              icon={Zap}
              editPath='/bikes/edit'
              addPath='/scooties/add'
              imagePath='/scootyimages'
              deletingId={deletingId}
              onDelete={handleDelete}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RecentMotorcycles;
