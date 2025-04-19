import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarIcon, Info, Bike } from "lucide-react";
import { bikeModels, dealerships, StepProps } from "../../../mockdata/data";

export const SummaryStep = ({ formData, fadeInUp }: StepProps) => {
  const selectedBike = bikeModels.find(
    (bike) => bike.id === formData.bikeModel
  );

  const selectedDealership = dealerships.find(
    (dealer) => dealer.id === formData.dealership
  );

  return (
    <motion.div
      key='step5'
      initial='hidden'
      animate='visible'
      exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
      variants={fadeInUp}
      className='space-y-4'
    >
      <h3 className='text-lg font-medium'>Review Your Test Ride Details</h3>

      <div className='space-y-4'>
        <div className='bg-gray-50 p-4 rounded-lg space-y-3'>
          <div className='flex items-center gap-2'>
            <Bike className='h-5 w-5 text-red-600' />
            <h4 className='font-medium'>Motorcycle</h4>
          </div>
          <p>{selectedBike?.name || "Not selected"}</p>
        </div>

        <div className='bg-gray-50 p-4 rounded-lg space-y-3'>
          <div className='flex items-center gap-2'>
            <CalendarIcon className='h-5 w-5 text-red-600' />
            <h4 className='font-medium'>Date & Time</h4>
          </div>
          <p>
            {formData.date ? format(formData.date, "PPPP") : "Not selected"} at{" "}
            {formData.time || "Not selected"}
          </p>
        </div>

        <div className='bg-gray-50 p-4 rounded-lg space-y-3'>
          <div className='flex items-center gap-2'>
            <Info className='h-5 w-5 text-red-600' />
            <h4 className='font-medium'>Dealership</h4>
          </div>
          <div>
            <p>{selectedDealership?.name || "Not selected"}</p>
            <p className='text-sm text-muted-foreground'>
              {selectedDealership?.address}
            </p>
          </div>
        </div>

        <div className='bg-gray-50 p-4 rounded-lg space-y-3'>
          <div className='flex items-center gap-2'>
            <Info className='h-5 w-5 text-red-600' />
            <h4 className='font-medium'>Personal Information</h4>
          </div>
          <div className='space-y-1'>
            <p>
              {formData.firstName} {formData.lastName}
            </p>
            <p>{formData.email}</p>
            <p>{formData.phone}</p>
          </div>
        </div>
      </div>

      <div className='p-4 bg-yellow-50 rounded-lg flex items-start gap-2'>
        <Info className='h-5 w-5 text-yellow-500 mt-0.5' />
        <p className='text-sm'>
          Please bring your valid motorcycle license and appropriate riding gear
          for your test ride. A dealership representative will contact you to
          confirm your appointment.
        </p>
      </div>
    </motion.div>
  );
};
