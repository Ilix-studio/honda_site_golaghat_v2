// src/components/service-booking/steps/ScheduleService.tsx

import { motion } from "framer-motion";
import { AlertTriangle, CalendarIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { serviceLocations, timeSlots } from "../../../mockdata/data";
import { ServiceFormValues } from "../../../lib/form-schema";
import { formatDate } from "../../../lib/dateUtils";

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

  // Find selected location
  const selectedLocation = serviceLocations.find(
    (location) => location.id === watchedValues.serviceLocation
  );

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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
        >
          <SelectTrigger
            className={errors.serviceLocation ? "border-red-500" : ""}
          >
            <SelectValue placeholder='Select a service center' />
          </SelectTrigger>
          <SelectContent>
            {serviceLocations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
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
          <PopoverContent className='w-auto p-0'>
            <Calendar
              mode='single'
              selected={watchedValues.date}
              onSelect={(date) => setValue("date", date as Date)}
              disabled={
                (date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0)) || // No past dates
                  date >
                    new Date(new Date().setMonth(new Date().getMonth() + 2)) || // Max 2 months ahead
                  date.getDay() === 0 // No Sundays
              }
              initialFocus
            />
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
            {timeSlots.map((time) => (
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
        <p className='text-sm'>
          Service appointments are subject to availability. A service advisor
          will confirm your appointment time.
        </p>
      </div>
    </motion.div>
  );
}
