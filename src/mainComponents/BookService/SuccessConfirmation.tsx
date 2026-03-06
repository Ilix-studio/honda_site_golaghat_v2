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
import { useGetBranchesQuery } from "@/redux-store/services/branchApi";
import { useGetMyVehicleInfoQuery } from "@/redux-store/services/customer/ServiceBookCustomerApi";
import { useAppSelector } from "@/hooks/redux";

const serviceTypeLabels: Record<string, string> = {
  "free-service-one": "First Service",
  "free-service-two": "Second Service",
  "free-service-three": "Third Service",
  "paid-service-one": "Paid Service One",
  "paid-service-two": "Paid Service Two",
  "paid-service-three": "Paid Service Three",
  "paid-service-four": "Paid Service Four",
  "paid-service-five": "Paid Service Five",
};

interface ServiceLocation {
  _id: string;
  branchName: string;
  address: string;
}

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

  const lastBookingId = useAppSelector(
    (state: any) => state.serviceBooking.lastBookingId
  );

  const { data: vehicleResponse } = useGetMyVehicleInfoQuery();
  const vehicle = vehicleResponse?.data ?? null;

  const { data: branchesResponse } = useGetBranchesQuery();
  const serviceLocations: ServiceLocation[] = branchesResponse?.data || [];

  const selectedLocation = serviceLocations.find(
    (l) => l._id === watchedValues.serviceLocation
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
          {lastBookingId && (
            <p className='text-center text-sm font-mono text-green-700 mt-1'>
              Booking ID: {lastBookingId}
            </p>
          )}
        </CardHeader>

        <CardContent className='text-center space-y-4'>
          <p>
            A service advisor from{" "}
            {selectedLocation?.branchName || "our service center"} will contact
            you shortly to confirm your appointment.
          </p>

          <div className='p-4 bg-gray-50 rounded-lg mt-4 text-left'>
            <div className='flex justify-between mb-2'>
              <span className='text-muted-foreground'>Service:</span>
              <span className='font-medium'>
                {serviceTypeLabels[watchedValues.serviceType ?? ""] ??
                  watchedValues.serviceType ??
                  "—"}
              </span>
            </div>
            <div className='flex justify-between mb-2'>
              <span className='text-muted-foreground'>Motorcycle:</span>
              <span className='font-medium'>{vehicle?.modelName ?? "—"}</span>
            </div>
            <div className='flex justify-between mb-2'>
              <span className='text-muted-foreground'>Location:</span>
              <span className='font-medium'>
                {selectedLocation?.branchName ?? "—"}
              </span>
            </div>
            <div className='flex justify-between mb-2'>
              <span className='text-muted-foreground'>Date:</span>
              <span className='font-medium'>
                {watchedValues.date
                  ? formatDate(watchedValues.date, "PPP")
                  : "—"}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Time:</span>
              <span className='font-medium'>{watchedValues.time || "—"}</span>
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
