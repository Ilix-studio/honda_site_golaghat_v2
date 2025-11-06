import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ServiceFormValues } from "../../../lib/form-schema";
import { useGetMyServiceStatsQuery } from "@/redux-store/services/customer/ServiceBookCustomerApi";

// Service types data (should match your backend FREE_SERVICES and PAID_SERVICES)
const serviceTypes = [
  {
    id: "free-service-one",
    name: "First service",
    price: "Free",
    type: "free",
  },
  {
    id: "free-service-two",
    name: "Second service",
    price: "Free",
    type: "free",
  },
  {
    id: "free-service-three",
    name: "Third service",
    price: "Free",
    type: "free",
  },
  {
    id: "paid-service-one",
    name: "Paid Service One",
    price: "₹2,500",
    type: "paid",
  },
  {
    id: "paid-service-two",
    name: "Paid Service Two",
    price: "₹5,000",
    type: "paid",
  },
  {
    id: "paid-service-three",
    name: "Paid Service Three",
    price: "₹3,000",
    type: "paid",
  },
  {
    id: "paid-service-four",
    name: "Paid Service Four",
    price: "₹1,500",
    type: "paid",
  },
  {
    id: "paid-service-five",
    name: "Paid Service Five",
    price: "₹2,000",
    type: "paid",
  },
];

interface ServiceSelectionProps {
  form: UseFormReturn<ServiceFormValues>;
}

export const ServiceSelection = ({ form }: ServiceSelectionProps) => {
  const {
    formState: { errors },
    watch,
    setValue,
  } = form;
  const watchedValues = watch();

  // Get service stats to show used/available services
  const { data: statsResponse, isLoading: statsLoading } =
    useGetMyServiceStatsQuery();
  const usedServices = statsResponse?.data?.usedServiceTypes || [];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const isServiceUsed = (serviceId: string) => usedServices.includes(serviceId);

  return (
    <motion.div
      key='step2'
      initial='hidden'
      animate='visible'
      exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
      variants={fadeInUp}
      className='space-y-4'
    >
      <div className='flex justify-between items-center'>
        <h3 className='text-lg font-medium'>Service Selection</h3>
        {statsResponse && (
          <div className='text-sm text-muted-foreground'>
            {statsResponse.data.availableServicesCount} services available
          </div>
        )}
      </div>

      {statsLoading && (
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <div className='animate-spin h-4 w-4 border-2 border-red-600 rounded-full border-t-transparent'></div>
          Loading service availability...
        </div>
      )}

      <div className='space-y-2'>
        <Label>Select Service Type</Label>
        <RadioGroup
          value={watchedValues.serviceType}
          onValueChange={(value) => setValue("serviceType", value)}
          className='grid grid-cols-1 gap-3'
        >
          {/* Free Services */}
          <div className='space-y-3'>
            <h4 className='text-sm font-medium text-green-600'>
              Free Services
            </h4>
            {serviceTypes
              .filter((s) => s.type === "free")
              .map((service) => {
                const isUsed = isServiceUsed(service.id);

                return (
                  <div
                    key={service.id}
                    className={`flex flex-col border rounded-lg p-4 transition-all ${
                      isUsed
                        ? "border-gray-300 bg-gray-50 opacity-60"
                        : watchedValues.serviceType === service.id
                        ? "border-red-600 bg-red-50"
                        : "hover:border-gray-400 cursor-pointer"
                    }`}
                    onClick={() =>
                      !isUsed && setValue("serviceType", service.id)
                    }
                  >
                    <div className='flex items-start gap-2'>
                      <RadioGroupItem
                        value={service.id}
                        id={`service-${service.id}`}
                        disabled={isUsed}
                        className='mt-1'
                      />
                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <Label
                            htmlFor={`service-${service.id}`}
                            className={`text-base font-medium ${
                              !isUsed ? "cursor-pointer" : "cursor-default"
                            }`}
                          >
                            {service.name}
                          </Label>
                          {isUsed && (
                            <Badge variant='secondary' className='text-xs'>
                              <CheckCircle className='h-3 w-3 mr-1' />
                              Used
                            </Badge>
                          )}
                          <Badge
                            variant='outline'
                            className='text-xs text-green-600'
                          >
                            FREE
                          </Badge>
                        </div>

                        {isUsed && (
                          <p className='text-xs text-red-500 mt-1'>
                            This service has already been used and cannot be
                            booked again.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Paid Services */}
          <div className='space-y-3'>
            <h4 className='text-sm font-medium text-blue-600'>Paid Services</h4>
            {serviceTypes
              .filter((s) => s.type === "paid")
              .map((service) => {
                const isUsed = isServiceUsed(service.id);

                return (
                  <div
                    key={service.id}
                    className={`flex flex-col border rounded-lg p-4 transition-all ${
                      isUsed
                        ? "border-gray-300 bg-gray-50 opacity-60"
                        : watchedValues.serviceType === service.id
                        ? "border-gray-600 bg-red-50"
                        : "hover:border-gray-400 cursor-pointer"
                    }`}
                    onClick={() =>
                      !isUsed && setValue("serviceType", service.id)
                    }
                  >
                    <div className='flex items-start gap-2'>
                      <RadioGroupItem
                        value={service.id}
                        id={`service-${service.id}`}
                        disabled={isUsed}
                        className='mt-1'
                      />
                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <Label
                            htmlFor={`service-${service.id}`}
                            className={`text-base font-medium ${
                              !isUsed ? "cursor-pointer" : "cursor-default"
                            }`}
                          >
                            {service.name}
                          </Label>
                          {isUsed && (
                            <Badge variant='secondary' className='text-xs'>
                              <CheckCircle className='h-3 w-3 mr-1' />
                              Used
                            </Badge>
                          )}
                        </div>

                        <div className='flex flex-wrap gap-x-4 gap-y-1 mt-2'>
                          <span className='text-xs flex items-center gap-1'>
                            <span className='font-medium'>Cost:</span>{" "}
                            {service.price}
                          </span>
                        </div>
                        {isUsed && (
                          <p className='text-xs text-red-500 mt-1'>
                            This service has already been used and cannot be
                            booked again.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </RadioGroup>
        {errors.serviceType && (
          <p className='text-red-500 text-sm'>{errors.serviceType.message}</p>
        )}
      </div>

      {statsResponse && (
        <div className='p-4 bg-blue-50 rounded-lg'>
          <h4 className='text-sm font-medium mb-2'>Your Service History</h4>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='text-muted-foreground'>Services Used:</span>
              <span className='ml-1 font-medium'>
                {statsResponse.data.usedServicesCount}
              </span>
            </div>
            <div>
              <span className='text-muted-foreground'>Available:</span>
              <span className='ml-1 font-medium'>
                {statsResponse.data.availableServicesCount}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
