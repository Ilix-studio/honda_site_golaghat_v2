import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { ServiceFormValues } from "../../../lib/form-schema";

// Define types for service data
interface ServiceType {
  id: string;
  name: string;
  description: string;
  estimatedTime: string;
  price: string;
}

// Service types data - you might want to move this to a constants file or API
const serviceTypes: ServiceType[] = [
  {
    id: "regular",
    name: "Regular Service",
    description:
      "Basic maintenance including oil change, filter replacement, and general inspection",
    estimatedTime: "2-3 hours",
    price: "₹2,500",
  },
  {
    id: "major",
    name: "Major Service",
    description:
      "Comprehensive service including all regular service items plus detailed inspection",
    estimatedTime: "4-6 hours",
    price: "₹5,000",
  },
  {
    id: "tires",
    name: "Tire Service",
    description: "Tire inspection, replacement, balancing, and alignment",
    estimatedTime: "1-2 hours",
    price: "₹3,000",
  },
  {
    id: "diagnostic",
    name: "Diagnostic Check",
    description: "Computer diagnostic scan to identify any electronic issues",
    estimatedTime: "1-2 hours",
    price: "₹1,000",
  },
  {
    id: "repair",
    name: "Repair Service",
    description: "Specific repairs for identified issues or problems",
    estimatedTime: "Varies",
    price: "Varies",
  },
  {
    id: "warranty",
    name: "Warranty Service",
    description: "Service covered under manufacturer warranty",
    estimatedTime: "2-4 hours",
    price: "Free",
  },
  {
    id: "recall",
    name: "Recall Service",
    description: "Service for manufacturer recalls and safety updates",
    estimatedTime: "1-3 hours",
    price: "Free",
  },
  {
    id: "inspection",
    name: "Safety Inspection",
    description: "Complete safety and roadworthiness inspection",
    estimatedTime: "1 hour",
    price: "₹800",
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

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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
          {serviceTypes.map((service: ServiceType) => (
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
    </motion.div>
  );
};
