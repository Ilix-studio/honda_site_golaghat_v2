import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetBikesQuery } from "@/redux-store/services/bikeApi";
import { useGetScootiesQuery } from "@/redux-store/services/scootyApi";
import { Bike, Zap } from "lucide-react";

const RecentMotorcycles = () => {
  const { data: bikesData, isLoading: bikesLoading } = useGetBikesQuery({});
  const { data: scootiesData, isLoading: scootiesLoading } =
    useGetScootiesQuery({});

  const LoadingSkeleton = () => (
    <div className='space-y-3'>
      {[...Array(3)].map((_, i) => (
        <div key={i} className='flex items-center space-x-4'>
          <div className='w-12 h-12 bg-gray-200 animate-pulse rounded'></div>
          <div className='flex-1 space-y-2'>
            <div className='h-4 bg-gray-200 animate-pulse rounded w-1/2'></div>
            <div className='h-3 bg-gray-200 animate-pulse rounded w-1/4'></div>
          </div>
        </div>
      ))}
    </div>
  );

  interface VehicleListProps {
    vehicles: { data: any[] } | undefined;
    isLoading: boolean;
    vehicleType: string;
    icon: React.ComponentType<{ className?: string }>;
    editPath: string;
  }

  const VehicleList = ({
    vehicles,
    isLoading,
    vehicleType,
    icon: Icon,
    editPath,
  }: VehicleListProps) => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }

    if (!vehicles?.data?.length) {
      return (
        <div className='text-center py-6 text-gray-500'>
          No {vehicleType.toLowerCase()}s available
        </div>
      );
    }

    return (
      <div className='space-y-3'>
        {vehicles.data.slice(0, 5).map((vehicle) => (
          <div
            key={vehicle.id || vehicle._id}
            className='flex items-center justify-between'
          >
            <div className='flex items-center space-x-4'>
              <div className='w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center'>
                <Icon className='h-6 w-6 text-gray-600' />
              </div>
              <div>
                <p className='font-medium'>{vehicle.modelName}</p>
                <p className='text-sm text-muted-foreground'>
                  {vehicle.category} • ₹
                  {vehicle.price?.toLocaleString() || "Price not available"}
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  vehicle.inStock
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {vehicle.inStock ? "In Stock" : "Out of Stock"}
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  (window.location.href = `${editPath}/${
                    vehicle._id || vehicle.id
                  }`)
                }
              >
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Vehicles</CardTitle>
          <CardDescription>
            Recently added vehicles to inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='bikes' className='w-full'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='bikes' className='flex items-center gap-2'>
                <Bike className='h-4 w-4' />
                Bikes
              </TabsTrigger>
              <TabsTrigger value='scooties' className='flex items-center gap-2'>
                <Zap className='h-4 w-4' />
                Scooty
              </TabsTrigger>
            </TabsList>

            <TabsContent value='bikes' className='mt-4'>
              <VehicleList
                vehicles={bikesData}
                isLoading={bikesLoading}
                vehicleType='Bike'
                icon={Bike}
                editPath='/admin/addbikes/edit'
              />
            </TabsContent>

            <TabsContent value='scooties' className='mt-4'>
              <VehicleList
                vehicles={scootiesData}
                isLoading={scootiesLoading}
                vehicleType='Scooty'
                icon={Zap}
                editPath='/admin/addscooties/edit'
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentMotorcycles;
