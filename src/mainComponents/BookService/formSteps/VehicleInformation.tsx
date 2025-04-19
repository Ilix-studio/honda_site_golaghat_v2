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
import { bikeModels } from "../../../mockdata/data";

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

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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
        <Label htmlFor='bikeModel'>Motorcycle Model</Label>
        <Select
          value={watchedValues.bikeModel}
          onValueChange={(value) => setValue("bikeModel", value)}
        >
          <SelectTrigger className={errors.bikeModel ? "border-red-500" : ""}>
            <SelectValue placeholder='Select your motorcycle model' />
          </SelectTrigger>
          <SelectContent>
            {bikeModels.map((bike) => (
              <SelectItem key={bike.id} value={bike.id}>
                {bike.name} ({bike.category})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.bikeModel && (
          <p className='text-red-500 text-sm'>{errors.bikeModel.message}</p>
        )}
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='year'>Year</Label>
          <Input
            id='year'
            placeholder='e.g., 2023'
            {...register("year")}
            className={errors.year ? "border-red-500" : ""}
          />
          {errors.year && (
            <p className='text-red-500 text-sm'>{errors.year.message}</p>
          )}
        </div>
        <div className='space-y-2'>
          <Label htmlFor='mileage'>Current Mileage</Label>
          <Input
            id='mileage'
            placeholder='e.g., 5000'
            {...register("mileage")}
            className={errors.mileage ? "border-red-500" : ""}
          />
          {errors.mileage && (
            <p className='text-red-500 text-sm'>{errors.mileage.message}</p>
          )}
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='vin'>VIN (Optional)</Label>
          <Input
            id='vin'
            placeholder='Vehicle Identification Number'
            {...register("vin")}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='registrationNumber'>
            Registration Number (Optional)
          </Label>
          <Input
            id='registrationNumber'
            placeholder='License plate number'
            {...register("registrationNumber")}
          />
        </div>
      </div>

      <div className='p-4 bg-blue-50 rounded-lg flex items-start gap-2'>
        <Info className='h-5 w-5 text-blue-500 mt-0.5' />
        <p className='text-sm'>
          Providing accurate vehicle information helps our technicians prepare
          for your service appointment.
        </p>
      </div>
    </motion.div>
  );
};
