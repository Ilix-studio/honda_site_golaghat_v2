// src/components/service-booking/steps/ScheduleService.tsx

import { motion } from "framer-motion";
import { AlertTriangle, CalendarIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "../../../lib/utils";
import { ServiceFormValues } from "../../../lib/form-schema";
import { formatDate } from "../../../lib/dateUtils";
import { useGetBranchesQuery } from "@/redux-store/services/branchApi";

// Define types
interface ServiceLocation {
  _id: string;
  branchName: string;
  address: string;
}

// Available time slots - you might want to move this to a constants file
const timeSlots: string[] = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
];

interface ScheduleServiceProps {
  form: UseFormReturn<ServiceFormValues>;
}

export function ScheduleService({ form }: ScheduleServiceProps) {
  const {
    formState: { errors },
    watch,
    setValue,
  } = form;
  const watchedValues = watch();

  // Get service locations from API
  const { data: branchesResponse, isLoading } = useGetBranchesQuery();
  const serviceLocations: ServiceLocation[] = branchesResponse?.data || [];

  // Find selected location
  const selectedLocation = serviceLocations.find(
    (location: ServiceLocation) =>
      location._id === watchedValues.serviceLocation
  );

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Handle date selection (you might want to implement a proper date picker here)
  const handleDateSelect = () => {
    // For now, we'll set a date 3 days from now as an example
    // In a real implementation, you'd use a proper date picker component
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    setValue("date", futureDate);
  };

  return (
    <motion.div
      key='step3'
      initial='hidden'
      animate='visible'
      exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
      variants={fadeInUp}
      className='space-y-4'
    >
      <h3 className='text-lg font-medium'>Schedule Your Service</h3>

      <div className='space-y-2'>
        <Label htmlFor='serviceLocation'>Service Location</Label>
        <Select
          value={watchedValues.serviceLocation}
          onValueChange={(value) => setValue("serviceLocation", value)}
          disabled={isLoading}
        >
          <SelectTrigger
            className={errors.serviceLocation ? "border-red-500" : ""}
          >
            <SelectValue
              placeholder={
                isLoading ? "Loading locations..." : "Select a service center"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {serviceLocations.map((location: ServiceLocation) => (
              <SelectItem key={location._id} value={location._id}>
                {location.branchName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.serviceLocation && (
          <p className='text-red-500 text-sm'>
            {errors.serviceLocation.message}
          </p>
        )}
      </div>

      {selectedLocation && (
        <div className='p-4 bg-gray-50 rounded-lg'>
          <h4 className='font-medium text-sm mb-1'>
            {selectedLocation.branchName}
          </h4>
          <p className='text-sm text-muted-foreground'>
            {selectedLocation.address}
          </p>
        </div>
      )}

      <div className='space-y-2'>
        <Label>Preferred Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className={cn(
                "w-full justify-start text-left font-normal",
                !watchedValues.date && "text-muted-foreground",
                errors.date && "border-red-500"
              )}
            >
              <CalendarIcon className='mr-2 h-4 w-4' />
              {watchedValues.date
                ? formatDate(watchedValues.date, "PPP")
                : "Select a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-4'>
            <div className='space-y-4'>
              <h4 className='font-medium'>Select a date</h4>
              <p className='text-sm text-muted-foreground'>
                Please call us to schedule your preferred date, or select a
                sample date below.
              </p>
              <Button
                onClick={handleDateSelect}
                className='w-full'
                variant='outline'
              >
                Select Date (3 days from now)
              </Button>
              <p className='text-xs text-muted-foreground'>
                Note: In a production app, this would be a proper date picker
                component.
              </p>
            </div>
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className='text-red-500 text-sm'>{errors.date.message}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label>Preferred Time</Label>
        <Select
          value={watchedValues.time}
          onValueChange={(value) => setValue("time", value)}
        >
          <SelectTrigger className={errors.time ? "border-red-500" : ""}>
            <SelectValue placeholder='Select a time slot' />
          </SelectTrigger>
          <SelectContent>
            {timeSlots.map((time: string) => (
              <SelectItem key={time} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.time && (
          <p className='text-red-500 text-sm'>{errors.time.message}</p>
        )}
      </div>

      <div className='p-4 bg-yellow-50 rounded-lg flex items-start gap-2'>
        <AlertTriangle className='h-5 w-5 text-yellow-500 mt-0.5' />
        <div className='text-sm'>
          <p className='font-medium mb-1'>Important:</p>
          <ul className='space-y-1 text-muted-foreground'>
            <li>• Service appointments are subject to availability</li>
            <li>
              • A service advisor will contact you to confirm your appointment
              time
            </li>
            <li>• Please arrive 15 minutes before your scheduled time</li>
            <li>• Cancellations must be made 24 hours in advance</li>
          </ul>
        </div>
      </div>

      {!serviceLocations.length && !isLoading && (
        <div className='p-4 bg-red-50 rounded-lg'>
          <p className='text-sm text-red-600'>
            Unable to load service locations. Please try again or contact
            support.
          </p>
        </div>
      )}
    </motion.div>
  );
}
