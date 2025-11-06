import { motion } from "framer-motion";
import { AlertTriangle, CalendarIcon, Clock } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useState, useEffect } from "react";
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
import { useLazyCheckAvailabilityQuery } from "@/redux-store/services/customer/ServiceBookCustomerApi";

interface ServiceLocation {
  _id: string;
  branchName: string;
  address: string;
}

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

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Get service locations from API
  const { data: branchesResponse, isLoading } = useGetBranchesQuery();
  const serviceLocations: ServiceLocation[] = branchesResponse?.data || [];

  // Lazy query for checking availability
  const [checkAvailability] = useLazyCheckAvailabilityQuery();

  // Check availability when branch and date are selected
  useEffect(() => {
    if (watchedValues.serviceLocation && selectedDate) {
      setCheckingAvailability(true);
      checkAvailability({
        branchId: watchedValues.serviceLocation,
        date: selectedDate.toISOString().split("T")[0],
      })
        .unwrap()
        .then((response) => {
          setAvailableSlots(response.data.availableSlots);
        })
        .catch(() => {
          setAvailableSlots([]);
        })
        .finally(() => {
          setCheckingAvailability(false);
        });
    }
  }, [watchedValues.serviceLocation, selectedDate, checkAvailability]);

  const selectedLocation = serviceLocations.find(
    (location: ServiceLocation) =>
      location._id === watchedValues.serviceLocation
  );

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setValue("date", date);
    setValue("time", ""); // Clear selected time when date changes
  };

  // Generate next 30 days for date selection
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Skip Sundays (assuming service center is closed)
      if (date.getDay() !== 0) {
        dates.push(date);
      }
    }
    return dates;
  };

  const availableDates = getAvailableDates();

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
          onValueChange={(value) => {
            setValue("serviceLocation", value);
            setValue("time", ""); // Clear time when location changes
          }}
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
              disabled={!watchedValues.serviceLocation}
            >
              <CalendarIcon className='mr-2 h-4 w-4' />
              {watchedValues.date
                ? formatDate(watchedValues.date, "PPP")
                : "Select a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-4'>
            <div className='space-y-4'>
              <h4 className='font-medium'>Available Dates</h4>
              <div className='grid grid-cols-3 gap-2 max-h-60 overflow-y-auto'>
                {availableDates.slice(0, 21).map((date) => (
                  <Button
                    key={date.toISOString()}
                    variant={
                      selectedDate?.toDateString() === date.toDateString()
                        ? "default"
                        : "outline"
                    }
                    className='text-xs p-2'
                    onClick={() => handleDateSelect(date)}
                  >
                    {date.getDate()}/{date.getMonth() + 1}
                  </Button>
                ))}
              </div>
              <p className='text-xs text-muted-foreground'>
                Service centers are closed on Sundays
              </p>
            </div>
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className='text-red-500 text-sm'>{errors.date.message}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label className='flex items-center gap-2'>
          Preferred Time
          {checkingAvailability && (
            <div className='animate-spin h-4 w-4 border-2 border-red-600 rounded-full border-t-transparent'></div>
          )}
        </Label>
        <Select
          value={watchedValues.time}
          onValueChange={(value) => setValue("time", value)}
          disabled={!selectedDate || checkingAvailability}
        >
          <SelectTrigger className={errors.time ? "border-red-500" : ""}>
            <SelectValue
              placeholder={
                !selectedDate
                  ? "Select a date first"
                  : checkingAvailability
                  ? "Checking availability..."
                  : "Select a time slot"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {availableSlots.length === 0 && !checkingAvailability ? (
              <SelectItem value='none' disabled>
                No time slots available
              </SelectItem>
            ) : (
              availableSlots.map((time: string) => (
                <SelectItem key={time} value={time}>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-4 w-4' />
                    {time}
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {errors.time && (
          <p className='text-red-500 text-sm'>{errors.time.message}</p>
        )}
        {selectedDate && availableSlots.length > 0 && (
          <p className='text-xs text-green-600'>
            {availableSlots.length} time slots available for{" "}
            {formatDate(selectedDate, "PPP")}
          </p>
        )}
      </div>

      <div className='p-4 bg-yellow-50 rounded-lg flex items-start gap-2'>
        <AlertTriangle className='h-5 w-5 text-yellow-500 mt-0.5' />
        <div className='text-sm'>
          <p className='font-medium mb-1'>Booking Guidelines:</p>
          <ul className='space-y-1 text-muted-foreground'>
            <li>• Time slots are 20 minutes apart to ensure quality service</li>
            <li>• Confirmation will be sent via SMS and email</li>
            <li>• Please arrive 15 minutes before your scheduled time</li>
            <li>• Cancellations must be made 24 hours in advance</li>
          </ul>
        </div>
      </div>

      {!isLoading && serviceLocations.length === 0 && (
        <div className='p-4 bg-red-50 rounded-lg'>
          <p className='text-sm text-red-600'>
            No service locations available. Please contact support.
          </p>
        </div>
      )}
    </motion.div>
  );
}
