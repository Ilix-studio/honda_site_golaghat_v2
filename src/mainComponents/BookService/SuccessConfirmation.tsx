// src/components/service-booking/SuccessConfirmation.tsx

import { motion } from "framer-motion";
import { Wrench } from "lucide-react";
import { formatDate } from "../../lib/dateUtils";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ServiceFormValues } from "../../lib/form-schema";
import { useGetBikesQuery } from "@/redux-store/services/bikeApi";
import { useGetBranchesQuery } from "@/redux-store/services/branchApi";

// Define types for service-related data
interface BikeModel {
  id: string;
  name?: string;
  modelName: string;
  category: string;
}

interface ServiceType {
  id: string;
  name: string;
  price: string;
  estimatedTime: string;
  description: string;
}

interface ServiceLocation {
  _id: string;
  id: string;
  name: string;
  address: string;
}

// Service types data - you should replace this with actual API data
const serviceTypes: ServiceType[] = [
  {
    id: "regular",
    name: "Regular Service",
    price: "₹2,500",
    estimatedTime: "2-3 hours",
    description: "Basic maintenance service",
  },
  {
    id: "major",
    name: "Major Service",
    price: "₹5,000",
    estimatedTime: "4-6 hours",
    description: "Comprehensive service check",
  },
  {
    id: "diagnostic",
    name: "Diagnostic Check",
    price: "₹1,000",
    estimatedTime: "1-2 hours",
    description: "Computer diagnostic scan",
  },
  {
    id: "repair",
    name: "Repair Service",
    price: "Varies",
    estimatedTime: "Varies",
    description: "Repair specific issues",
  },
  {
    id: "tires",
    name: "Tire Service",
    price: "₹3,000",
    estimatedTime: "1-2 hours",
    description: "Tire replacement and balancing",
  },
  {
    id: "warranty",
    name: "Warranty Service",
    price: "Free",
    estimatedTime: "2-4 hours",
    description: "Warranty-covered repairs",
  },
  {
    id: "recall",
    name: "Recall Service",
    price: "Free",
    estimatedTime: "1-3 hours",
    description: "Manufacturer recall service",
  },
  {
    id: "inspection",
    name: "Safety Inspection",
    price: "₹800",
    estimatedTime: "1 hour",
    description: "Complete safety inspection",
  },
];

interface SuccessConfirmationProps {
  form: UseFormReturn<ServiceFormValues>;
  onReset: () => void;
}

export function SuccessConfirmation({
  form,
  onReset,
}: SuccessConfirmationProps) {
  const { watch, reset } = form;
  const watchedValues = watch();

  // Get bikes and branches data from API
  const { data: bikesResponse } = useGetBikesQuery({});
  const { data: branchesResponse } = useGetBranchesQuery();

  const bikeModels = bikesResponse?.data || [];
  const serviceLocations = branchesResponse?.data || [];

  // Get selected items for summary
  const selectedBike = bikeModels.find(
    (bike: BikeModel) => bike.id === watchedValues.bikeModel
  );
  const selectedService = serviceTypes.find(
    (service: ServiceType) => service.id === watchedValues.serviceType
  );
  const selectedLocation = serviceLocations.find(
    (location: ServiceLocation) =>
      location._id === watchedValues.serviceLocation ||
      location.id === watchedValues.serviceLocation
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className='border-2 border-green-500'>
        <CardHeader>
          <div className='mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-8 w-8 text-green-500'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </div>
          <CardTitle className='text-2xl text-center'>
            Service Booked!
          </CardTitle>
          <CardDescription className='text-center'>
            Your service appointment has been scheduled successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className='text-center space-y-4'>
          <p>
            We've sent a confirmation email to{" "}
            <span className='font-medium'>{watchedValues.email}</span> with all
            the details.
          </p>
          <p>
            A service advisor from{" "}
            {selectedLocation?.name || "our service center"} will contact you
            shortly to confirm your appointment.
          </p>
          <div className='p-4 bg-gray-50 rounded-lg mt-4'>
            <div className='flex justify-between mb-2'>
              <span className='text-muted-foreground'>Service:</span>
              <span className='font-medium'>
                {selectedService?.name || "Service"}
              </span>
            </div>
            <div className='flex justify-between mb-2'>
              <span className='text-muted-foreground'>Motorcycle:</span>
              <span className='font-medium'>
                {selectedBike?.modelName ||
                  selectedBike?.modelName ||
                  "Motorcycle"}
              </span>
            </div>
            <div className='flex justify-between mb-2'>
              <span className='text-muted-foreground'>Date:</span>
              <span className='font-medium'>
                {watchedValues.date
                  ? formatDate(watchedValues.date, "PPP")
                  : "Date to be confirmed"}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Time:</span>
              <span className='font-medium'>
                {watchedValues.time || "Time to be confirmed"}
              </span>
            </div>
          </div>

          <div className='p-4 bg-blue-50 rounded-lg flex items-start gap-2 text-left'>
            <Wrench className='h-5 w-5 text-blue-500 mt-0.5' />
            <div className='text-sm'>
              <p className='font-medium'>What to bring to your appointment:</p>
              <ul className='list-disc list-inside mt-1 space-y-1'>
                <li>Your motorcycle key</li>
                <li>Proof of ownership (registration)</li>
                <li>Service history (if available)</li>
                <li>Valid driving license</li>
                <li>Insurance documents</li>
              </ul>
            </div>
          </div>

          <div className='p-4 bg-yellow-50 rounded-lg text-left'>
            <p className='text-sm text-yellow-800'>
              <strong>Important:</strong> Please arrive 15 minutes before your
              scheduled appointment time. If you need to reschedule, please
              contact us at least 24 hours in advance.
            </p>
          </div>
        </CardContent>
        <CardFooter className='flex justify-center gap-4'>
          <Button
            onClick={() => (window.location.href = "/")}
            className='bg-red-600 hover:bg-red-700'
          >
            Return to Homepage
          </Button>
          <Button
            variant='outline'
            onClick={() => {
              reset();
              onReset();
            }}
          >
            Book Another Service
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
