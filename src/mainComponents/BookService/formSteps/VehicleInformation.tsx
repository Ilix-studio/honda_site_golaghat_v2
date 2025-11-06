import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ServiceFormValues } from "../../../lib/form-schema";
import { useGetMyVehiclesQuery } from "@/redux-store/services/customer/customerVehicleApi";

interface VehicleInformationProps {
  form: UseFormReturn<ServiceFormValues>;
}

export const VehicleInformation = ({ form }: VehicleInformationProps) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;
  const watchedValues = watch();

  // Get customer's vehicles from API
  const { data: vehiclesResponse, isLoading } = useGetMyVehiclesQuery();
  const myVehicles = vehiclesResponse?.data || [];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Get selected vehicle details
  const selectedVehicle = myVehicles.find(
    (vehicle: any) => vehicle._id === watchedValues.bikeModel
  );

  // Auto-fill form when vehicle is selected
  const handleVehicleSelect = (vehicleId: string) => {
    setValue("bikeModel", vehicleId);

    const vehicle = myVehicles.find((v: any) => v._id === vehicleId);
    if (vehicle) {
      // Map numberPlate to registrationNumber in form

      // Use serviceStatus.kilometers for mileage
      if (vehicle.serviceStatus?.kilometers) {
        setValue("mileage", vehicle.serviceStatus.kilometers.toString());
      }

      // Calculate year from purchaseDate
    }
  };

  return (
    <motion.div
      key='step1'
      initial='hidden'
      animate='visible'
      exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
      variants={fadeInUp}
      className='space-y-4'
    >
      <h3 className='text-lg font-medium'>Vehicle Information</h3>

      <div className='space-y-2'>
        <Label htmlFor='bikeModel'>Your Motorcycle</Label>
        <Select
          value={watchedValues.bikeModel}
          onValueChange={handleVehicleSelect}
          disabled={isLoading}
        >
          <SelectTrigger className={errors.bikeModel ? "border-red-500" : ""}>
            <SelectValue
              placeholder={
                isLoading
                  ? "Loading your vehicles..."
                  : "Select your motorcycle"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {myVehicles.map((vehicle: any) => (
              <SelectItem key={vehicle._id} value={vehicle._id}>
                {vehicle.stockConcept?.bikeInfo?.modelName ||
                  vehicle.modelName ||
                  "Unknown Model"}{" "}
                ({vehicle.stockConcept?.bikeInfo?.category || "Unknown"})
                {vehicle.numberPlate && ` - ${vehicle.numberPlate}`}
              </SelectItem>
            ))}
            {!isLoading && myVehicles.length === 0 && (
              <SelectItem value='none' disabled>
                No vehicles found. Please add a vehicle first.
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        {errors.bikeModel && (
          <p className='text-red-500 text-sm'>{errors.bikeModel.message}</p>
        )}
      </div>

      {/* Selected vehicle details */}
      {selectedVehicle && (
        <div className='p-4 bg-green-50 rounded-lg'>
          <h4 className='text-sm font-medium mb-2'>Selected Motorcycle:</h4>
          <div className='space-y-1'>
            <p className='text-sm'>
              <span className='font-medium'>Model:</span>{" "}
              {selectedVehicle.stockConcept?.bikeInfo?.modelName ||
                selectedVehicle.modelName}
            </p>
            <p className='text-sm'>
              <span className='font-medium'>Category:</span>{" "}
              {selectedVehicle.stockConcept?.bikeInfo?.category || "Motorcycle"}
            </p>
            {selectedVehicle.stockConcept?.engineDetails?.displacement && (
              <p className='text-sm'>
                <span className='font-medium'>Engine:</span>{" "}
                {selectedVehicle.stockConcept.engineDetails.displacement}cc
              </p>
            )}
            {selectedVehicle.numberPlate && (
              <p className='text-sm'>
                <span className='font-medium'>Registration:</span>{" "}
                {selectedVehicle.numberPlate}
              </p>
            )}
          </div>
        </div>
      )}

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='mileage'>Current Mileage (km)</Label>
          <Input
            id='mileage'
            type='number'
            placeholder='e.g., 5000'
            {...register("mileage")}
            className={errors.mileage ? "border-red-500" : ""}
          />
          {errors.mileage && (
            <p className='text-red-500 text-sm'>{errors.mileage.message}</p>
          )}
        </div>
      </div>

      <div className='p-4 bg-blue-50 rounded-lg flex items-start gap-2'>
        <Info className='h-5 w-5 text-blue-500 mt-0.5' />
        <div className='text-sm'>
          <p className='font-medium mb-1'>Vehicle Information:</p>
          <ul className='space-y-1 text-muted-foreground'>
            <li>Select from your registered vehicles for faster service</li>
            <li> Pre-filled information helps our technicians prepare</li>
            <li>Update mileage for accurate service recommendations</li>
          </ul>
        </div>
      </div>

      {isLoading && (
        <div className='flex items-center justify-center py-4'>
          <div className='animate-spin h-6 w-6 border-2 border-red-600 rounded-full border-t-transparent'></div>
          <span className='ml-2 text-sm text-muted-foreground'>
            Loading your vehicles...
          </span>
        </div>
      )}

      {!isLoading && myVehicles.length === 0 && (
        <div className='p-4 bg-amber-50 rounded-lg'>
          <p className='text-sm text-amber-600'>
            No vehicles found in your account. Please add a vehicle to your
            profile first.
          </p>
        </div>
      )}
    </motion.div>
  );
};
