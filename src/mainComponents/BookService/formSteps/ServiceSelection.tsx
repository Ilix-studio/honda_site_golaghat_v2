import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

import { ServiceFormValues } from "../../../lib/form-schema";
import { additionalServices, serviceTypes } from "../../../mockdata/data";

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

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Toggle additional service selection
  const toggleAdditionalService = (serviceId: string) => {
    const currentServices = watchedValues.additionalServices || [];

    if (currentServices.includes(serviceId)) {
      setValue(
        "additionalServices",
        currentServices.filter((id) => id !== serviceId)
      );
    } else {
      setValue("additionalServices", [...currentServices, serviceId]);
    }
  };

  return (
    <motion.div
      key='step2'
      initial='hidden'
      animate='visible'
      exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
      variants={fadeInUp}
      className='space-y-4'
    >
      <h3 className='text-lg font-medium'>Service Selection</h3>

      <div className='space-y-2'>
        <Label>Service Type</Label>
        <RadioGroup
          value={watchedValues.serviceType}
          onValueChange={(value) => setValue("serviceType", value)}
          className='grid grid-cols-1 gap-3'
        >
          {serviceTypes.map((service) => (
            <div
              key={service.id}
              className={`flex flex-col border rounded-lg p-4 cursor-pointer transition-all ${
                watchedValues.serviceType === service.id
                  ? "border-red-600 bg-red-50"
                  : "hover:border-gray-400"
              }`}
              onClick={() => setValue("serviceType", service.id)}
            >
              <div className='flex items-start gap-2'>
                <RadioGroupItem
                  value={service.id}
                  id={`service-${service.id}`}
                  className='mt-1'
                />
                <div className='flex-1'>
                  <Label
                    htmlFor={`service-${service.id}`}
                    className='text-base font-medium cursor-pointer'
                  >
                    {service.name}
                  </Label>
                  <p className='text-sm text-muted-foreground mt-1'>
                    {service.description}
                  </p>
                  <div className='flex flex-wrap gap-x-4 gap-y-1 mt-2'>
                    <span className='text-xs flex items-center gap-1'>
                      <Clock className='h-3 w-3' /> {service.estimatedTime}
                    </span>
                    <span className='text-xs flex items-center gap-1'>
                      <span className='font-medium'>Est. Cost:</span>{" "}
                      {service.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </RadioGroup>
        {errors.serviceType && (
          <p className='text-red-500 text-sm'>{errors.serviceType.message}</p>
        )}
      </div>

      <div className='space-y-2 pt-4'>
        <Label>Additional Services (Optional)</Label>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2'>
          {additionalServices.map((service) => (
            <div
              key={service.id}
              className={`flex items-start gap-2 border rounded-lg p-3 cursor-pointer transition-all ${
                watchedValues.additionalServices?.includes(service.id)
                  ? "border-red-600 bg-red-50"
                  : "hover:border-gray-400"
              }`}
              onClick={() => toggleAdditionalService(service.id)}
            >
              <Checkbox
                id={`additional-${service.id}`}
                checked={watchedValues.additionalServices?.includes(service.id)}
                onCheckedChange={() => toggleAdditionalService(service.id)}
                className='mt-1'
              />
              <div>
                <Label
                  htmlFor={`additional-${service.id}`}
                  className='cursor-pointer'
                >
                  {service.name}
                </Label>
                <p className='text-xs text-muted-foreground mt-1'>
                  {service.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
