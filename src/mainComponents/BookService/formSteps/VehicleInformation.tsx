// src/components/service-booking/steps/VehicleInformation.tsx

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
import { useGetBikesQuery } from "@/redux-store/services/BikeSystemApi/bikeApi";

// Define types for bike models
interface BikeModel {
  _id: string;
  modelName: string;
  category: string;
  year: number;
  engineSize: string;
}

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

  // Get bikes data from API
  const { data: bikesResponse, isLoading } = useGetBikesQuery({});
  // Extract bikes array from nested response structure
  const bikeModels: BikeModel[] = bikesResponse?.data?.bikes || [];

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Get current year for validation
  const currentYear = new Date().getFullYear();

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
        <Label htmlFor='bikeModel'>Motorcycle Model</Label>
        <Select
          value={watchedValues.bikeModel}
          onValueChange={(value) => setValue("bikeModel", value)}
          disabled={isLoading}
        >
          <SelectTrigger className={errors.bikeModel ? "border-red-500" : ""}>
            <SelectValue
              placeholder={
                isLoading ? "Loading models..." : "Select your motorcycle model"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {bikeModels.map((bike: BikeModel) => (
              <SelectItem key={bike._id} value={bike._id}>
                {bike.modelName} ({bike.category})
              </SelectItem>
            ))}
            {!isLoading && bikeModels.length === 0 && (
              <SelectItem value='other' disabled>
                No models available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        {errors.bikeModel && (
          <p className='text-red-500 text-sm'>{errors.bikeModel.message}</p>
        )}
        {!isLoading && bikeModels.length === 0 && (
          <p className='text-amber-600 text-sm'>
            Unable to load motorcycle models. Please contact support if this
            persists.
          </p>
        )}
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='year'>Year</Label>
          <Input
            id='year'
            type='number'
            placeholder='e.g., 2023'
            min='1990'
            max={currentYear + 1}
            {...register("year")}
            className={errors.year ? "border-red-500" : ""}
          />
          {errors.year && (
            <p className='text-red-500 text-sm'>{errors.year.message}</p>
          )}
          <p className='text-xs text-muted-foreground'>
            Enter the year your motorcycle was manufactured
          </p>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='mileage'>Current Mileage</Label>
          <Input
            id='mileage'
            type='number'
            placeholder='e.g., 5000'
            min='0'
            {...register("mileage")}
            className={errors.mileage ? "border-red-500" : ""}
          />
          {errors.mileage && (
            <p className='text-red-500 text-sm'>{errors.mileage.message}</p>
          )}
          <p className='text-xs text-muted-foreground'>
            Enter the current odometer reading in kilometers
          </p>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='vin'>VIN (Optional)</Label>
          <Input
            id='vin'
            placeholder='Vehicle Identification Number'
            maxLength={17}
            {...register("vin")}
            className='uppercase'
            style={{ textTransform: "uppercase" }}
          />
          <p className='text-xs text-muted-foreground'>
            17-character Vehicle Identification Number
          </p>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='registrationNumber'>
            Registration Number (Optional)
          </Label>
          <Input
            id='registrationNumber'
            placeholder='License plate number'
            {...register("registrationNumber")}
            className='uppercase'
            style={{ textTransform: "uppercase" }}
          />
          <p className='text-xs text-muted-foreground'>
            Your motorcycle's license plate number
          </p>
        </div>
      </div>

      {/* Selected bike details */}
      {watchedValues.bikeModel && (
        <div className='p-4 bg-green-50 rounded-lg'>
          <h4 className='text-sm font-medium mb-2'>Selected Motorcycle:</h4>
          {(() => {
            const selectedBike = bikeModels.find(
              (bike: BikeModel) => bike._id === watchedValues.bikeModel
            );
            if (selectedBike) {
              return (
                <div className='space-y-1'>
                  <p className='text-sm'>
                    <span className='font-medium'>Model:</span>{" "}
                    {selectedBike.modelName}
                  </p>
                  <p className='text-sm'>
                    <span className='font-medium'>Category:</span>{" "}
                    {selectedBike.category}
                  </p>
                  {selectedBike.engineSize && (
                    <p className='text-sm'>
                      <span className='font-medium'>Engine:</span>{" "}
                      {selectedBike.engineSize}
                    </p>
                  )}
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}

      <div className='p-4 bg-blue-50 rounded-lg flex items-start gap-2'>
        <Info className='h-5 w-5 text-blue-500 mt-0.5' />
        <div className='text-sm'>
          <p className='font-medium mb-1'>Why we need this information:</p>
          <ul className='space-y-1 text-muted-foreground'>
            <li>• Helps our technicians prepare the right tools and parts</li>
            <li>
              • Ensures we have the correct service manual and specifications
            </li>
            <li>• Allows us to check for any recalls or service bulletins</li>
            <li>• Helps us provide accurate service estimates</li>
          </ul>
        </div>
      </div>

      {isLoading && (
        <div className='flex items-center justify-center py-4'>
          <div className='animate-spin h-6 w-6 border-2 border-red-600 rounded-full border-t-transparent'></div>
          <span className='ml-2 text-sm text-muted-foreground'>
            Loading motorcycle models...
          </span>
        </div>
      )}
    </motion.div>
  );
};
