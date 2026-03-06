import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetBikesQuery } from "@/redux-store/services/BikeSystemApi/bikeApi";
import {
  Zap,
  Calendar,
  Star,
  AlertTriangle,
  Eye,
  Bike,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// ─── helpers ────────────────────────────────────────────────────────────────
const formatPrice = (priceBreakdown: any): string => {
  if (priceBreakdown?.onRoadPrice)
    return `₹${priceBreakdown.onRoadPrice.toLocaleString()}`;
  if (priceBreakdown?.exShowroomPrice)
    return `₹${priceBreakdown.exShowroomPrice.toLocaleString()}`;
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
  <div className='space-y-3'>
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className='flex items-center gap-4 p-4 rounded-2xl bg-gray-50'
      >
        <div className='w-16 h-16 bg-gray-200 animate-pulse rounded-xl shrink-0' />
        <div className='flex-1 space-y-2'>
          <div className='h-4 bg-gray-200 animate-pulse rounded w-3/4' />
          <div className='h-3 bg-gray-200 animate-pulse rounded w-1/2' />
          <div className='h-3 bg-gray-200 animate-pulse rounded w-1/4' />
        </div>
        <div className='flex gap-2'>
          <div className='h-8 w-16 bg-gray-200 animate-pulse rounded-lg' />
          <div className='h-8 w-16 bg-gray-200 animate-pulse rounded-lg' />
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

  imagePath: string;
}

const VehicleRow = ({
  vehicle,
  index,
  icon: Icon,

  imagePath,
}: VehicleRowProps) => {
  const stock = getStockStatus(vehicle.stockAvailable);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: "easeOut" }}
      className='group relative flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200'
    >
      {/* image placeholder */}
      <div className='relative w-16 h-16 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center shrink-0 overflow-hidden'>
        <Icon className='h-8 w-8 text-red-500' />
        {vehicle.isNewModel && (
          <span className='absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-400' />
        )}
      </div>

      {/* info */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2 mb-0.5'>
          <h3 className='font-bold text-gray-900 text-sm truncate'>
            {vehicle.modelName}
          </h3>
          {vehicle.isNewModel && (
            <span className='inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 shrink-0'>
              <Star className='w-2.5 h-2.5' />
              New
            </span>
          )}
        </div>

        <div className='flex items-center gap-2 text-xs text-gray-400 mb-1.5 flex-wrap'>
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

        <div className='flex items-center gap-2'>
          <span className='text-sm font-black text-red-600'>
            {formatPrice(vehicle.priceBreakdown)}
          </span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${stock.color}`}
          >
            {stock.text}
          </span>
        </div>
      </div>

      {/* actions — visible on hover */}
      <div className='flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
        <Link to={`${imagePath}/${vehicle._id}`}>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 px-2.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          >
            <Eye className='h-3.5 w-3.5 mr-1' />
            <span className='text-xs'>Images</span>
          </Button>
        </Link>
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
  addPath: string;
  imagePath: string;
}

const VehicleList = ({
  vehicles,
  isLoading,
  isError,
  vehicleType,
  icon: Icon,
  imagePath,
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
        <Link to='/admin/bikes/add'>
          <Button size='sm' className='bg-red-600 hover:bg-red-700 rounded-xl'>
            <Plus className='h-3.5 w-3.5 mr-1.5' />
            Add First {vehicleType}
          </Button>
        </Link>
      </div>
    );

  return (
    <div className='space-y-2'>
      {vehicles.data.bikes.map((vehicle, index) => (
        <VehicleRow
          key={vehicle._id}
          vehicle={vehicle}
          index={index}
          icon={Icon}
          imagePath={imagePath}
        />
      ))}

      {vehicles.data.bikes.length >= 5 && (
        <div className='pt-2 flex justify-center'>
          <Link
            to={vehicleType === "Bike" ? "/admin/bikes" : "/admin/scooters"}
          >
            <Button
              variant='ghost'
              size='sm'
              className='text-xs text-gray-500 hover:text-gray-900 rounded-xl'
            >
              View all {vehicleType}s
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
        <Link to='/admin/bikes/add'>
          <Button
            size='sm'
            className='bg-red-600 hover:bg-red-700 rounded-xl h-8 text-xs'
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
              addPath='/admin/bikes/add'
              imagePath='/admin/bikeimages'
            />
          </TabsContent>

          <TabsContent value='scooties' className='mt-0'>
            <VehicleList
              vehicles={scootiesData}
              isLoading={scootiesLoading}
              isError={scootiesError}
              vehicleType='Scooty'
              icon={Zap}
              addPath='/admin/addscooties'
              imagePath='/admin/scootyimages'
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RecentMotorcycles;
