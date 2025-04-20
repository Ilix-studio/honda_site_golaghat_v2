import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { formatDate } from "../../../lib/dateUtils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  bikeModels,
  serviceTypes,
  serviceLocations,
  additionalServices,
} from "../../../mockdata/data";
import { ServiceFormValues } from "../../../lib/form-schema";

interface BookingSummaryProps {
  form: UseFormReturn<ServiceFormValues>;
}

export function BookingSummary({ form }: BookingSummaryProps) {
  const { watch } = form;
  const watchedValues = watch();

  // Get selected items for summary
  const selectedBike = bikeModels.find(
    (bike) => bike.id === watchedValues.bikeModel
  );
  const selectedService = serviceTypes.find(
    (service) => service.id === watchedValues.serviceType
  );
  const selectedLocation = serviceLocations.find(
    (location) => location.id === watchedValues.serviceLocation
  );
  const selectedAdditionalServices = additionalServices.filter((service) =>
    watchedValues.additionalServices?.includes(service.id)
  );

  // Calculate estimated total cost
  const calculateEstimatedCost = () => {
    if (!selectedService) return "Varies";

    const baseCost = selectedService.price;

    if (selectedAdditionalServices.length > 0) {
      return `${baseCost} + additional services`;
    }

    return baseCost;
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      key='step6'
      initial='hidden'
      animate='visible'
      exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
      variants={fadeInUp}
      className='space-y-4'
    >
      <h3 className='text-lg font-medium'>Review Your Service Booking</h3>

      <Accordion type='single' collapsible className='w-full'>
        <AccordionItem value='vehicle'>
          <AccordionTrigger className='text-base font-medium'>
            Vehicle Information
          </AccordionTrigger>
          <AccordionContent className='space-y-2'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Model:</span>
              <span className='font-medium'>
                {selectedBike?.name || "Not selected"}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Year:</span>
              <span>{watchedValues.year}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Mileage:</span>
              <span>{watchedValues.mileage} miles</span>
            </div>
            {watchedValues.vin && (
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>VIN:</span>
                <span>{watchedValues.vin}</span>
              </div>
            )}
            {watchedValues.registrationNumber && (
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Registration:</span>
                <span>{watchedValues.registrationNumber}</span>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value='service'>
          <AccordionTrigger className='text-base font-medium'>
            Service Details
          </AccordionTrigger>
          <AccordionContent className='space-y-2'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Service Type:</span>
              <span className='font-medium'>
                {selectedService?.name || "Not selected"}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Estimated Time:</span>
              <span>{selectedService?.estimatedTime}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Estimated Cost:</span>
              <span>{calculateEstimatedCost()}</span>
            </div>

            {selectedAdditionalServices.length > 0 && (
              <div className='mt-2'>
                <span className='text-muted-foreground'>
                  Additional Services:
                </span>
                <div className='flex flex-wrap gap-2 mt-1'>
                  {selectedAdditionalServices.map((service) => (
                    <Badge key={service.id} variant='secondary'>
                      {service.name} ({service.price})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value='schedule'>
          <AccordionTrigger className='text-base font-medium'>
            Schedule
          </AccordionTrigger>
          <AccordionContent className='space-y-2'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Service Center:</span>
              <span className='font-medium'>
                {selectedLocation?.name || "Not selected"}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Address:</span>
              <span>{selectedLocation?.address}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Date:</span>
              <span>
                {watchedValues.date
                  ? formatDate(watchedValues.date, "PPP")
                  : "Not selected"}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Time:</span>
              <span>{watchedValues.time || "Not selected"}</span>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value='customer'>
          <AccordionTrigger className='text-base font-medium'>
            Customer Information
          </AccordionTrigger>
          <AccordionContent className='space-y-2'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Name:</span>
              <span>
                {watchedValues.firstName} {watchedValues.lastName}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Email:</span>
              <span>{watchedValues.email}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Phone:</span>
              <span>{watchedValues.phone}</span>
            </div>
          </AccordionContent>
        </AccordionItem>

        {(watchedValues.issues ||
          watchedValues.dropOff ||
          watchedValues.waitOnsite) && (
          <AccordionItem value='additional'>
            <AccordionTrigger className='text-base font-medium'>
              Additional Information
            </AccordionTrigger>
            <AccordionContent className='space-y-2'>
              {watchedValues.issues && (
                <div>
                  <span className='text-muted-foreground'>
                    Special Requests/Issues:
                  </span>
                  <p className='mt-1'>{watchedValues.issues}</p>
                </div>
              )}
              {watchedValues.dropOff && (
                <div className='flex items-center gap-2'>
                  <Checkbox checked disabled />
                  <span>Early drop-off requested</span>
                </div>
              )}
              {watchedValues.waitOnsite && (
                <div className='flex items-center gap-2'>
                  <Checkbox checked disabled />
                  <span>Customer will wait on-site</span>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      <div className='p-4 bg-yellow-50 rounded-lg flex items-start gap-2'>
        <Info className='h-5 w-5 text-yellow-500 mt-0.5' />
        <p className='text-sm'>
          A service advisor will contact you to confirm your appointment and
          provide any additional information. Please note that the final cost
          may vary based on the actual work required.
        </p>
      </div>
    </motion.div>
  );
}
