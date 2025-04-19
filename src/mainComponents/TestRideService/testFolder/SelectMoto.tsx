import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bikeModels, dealerships, StepProps } from "../../../mockdata/data";

export const MotorcycleSelectionStep = ({
  formData,
  updateFormData,
  errors,
  fadeInUp,
}: StepProps) => {
  const selectedDealership = dealerships.find(
    (dealer) => dealer.id === formData.dealership
  );

  return (
    <motion.div
      key='step2'
      initial='hidden'
      animate='visible'
      exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
      variants={fadeInUp}
      className='space-y-4'
    >
      <h3 className='text-lg font-medium'>Select Your Motorcycle</h3>
      <div className='space-y-2'>
        <Label htmlFor='bikeModel'>Motorcycle Model</Label>
        <Select
          value={formData.bikeModel}
          onValueChange={(value) =>
            updateFormData && updateFormData("bikeModel", value)
          }
        >
          <SelectTrigger
            id='bikeModel'
            className={errors?.bikeModel ? "border-red-500" : ""}
          >
            <SelectValue placeholder='Select a motorcycle' />
          </SelectTrigger>
          <SelectContent>
            {bikeModels.map((bike) => (
              <SelectItem key={bike.id} value={bike.id}>
                {bike.name} ({bike.category})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.bikeModel && (
          <p className='text-red-500 text-sm'>{errors.bikeModel}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='dealership'>Preferred Dealership</Label>
        <Select
          value={formData.dealership}
          onValueChange={(value) =>
            updateFormData && updateFormData("dealership", value)
          }
        >
          <SelectTrigger
            id='dealership'
            className={errors?.dealership ? "border-red-500" : ""}
          >
            <SelectValue placeholder='Select a dealership' />
          </SelectTrigger>
          <SelectContent>
            {dealerships.map((dealer) => (
              <SelectItem key={dealer.id} value={dealer.id}>
                {dealer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.dealership && (
          <p className='text-red-500 text-sm'>{errors.dealership}</p>
        )}
      </div>

      {selectedDealership && (
        <div className='p-4 bg-gray-50 rounded-lg'>
          <p className='text-sm text-muted-foreground'>
            {selectedDealership.address}
          </p>
        </div>
      )}
    </motion.div>
  );
};
