// src/components/service-booking/steps/AdditionalInformation.tsx

import { motion } from "framer-motion";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ServiceFormValues } from "../../../lib/form-schema";

interface AdditionalInformationProps {
  form: UseFormReturn<ServiceFormValues>;
}

export const AdditionalInformation = ({ form }: AdditionalInformationProps) => {
  const {
    register,
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
      key='step5'
      initial='hidden'
      animate='visible'
      exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
      variants={fadeInUp}
      className='space-y-4'
    >
      <h3 className='text-lg font-medium'>Additional Information</h3>

      <div className='space-y-2'>
        <Label htmlFor='issues'>Describe any issues or special requests</Label>
        <Textarea
          id='issues'
          placeholder='Please describe any specific issues with your motorcycle or special requests for the service'
          {...register("issues")}
          className='min-h-[100px]'
        />
      </div>

      <div className='space-y-3 pt-2'>
        <div className='flex items-start space-x-2'>
          <Checkbox
            id='dropOff'
            checked={watchedValues.dropOff}
            onCheckedChange={(checked) =>
              setValue("dropOff", checked as boolean)
            }
          />
          <div className='grid gap-1.5 leading-none'>
            <label
              htmlFor='dropOff'
              className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            >
              Early drop-off
            </label>
            <p className='text-sm text-muted-foreground'>
              I would like to drop off my motorcycle before the service center
              opens
            </p>
          </div>
        </div>

        <div className='flex items-start space-x-2'>
          <Checkbox
            id='waitOnsite'
            checked={watchedValues.waitOnsite}
            onCheckedChange={(checked) =>
              setValue("waitOnsite", checked as boolean)
            }
          />
          <div className='grid gap-1.5 leading-none'>
            <label
              htmlFor='waitOnsite'
              className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            >
              Wait on-site
            </label>
            <p className='text-sm text-muted-foreground'>
              I would like to wait at the service center while my motorcycle is
              being serviced
            </p>
          </div>
        </div>
      </div>

      <div className='pt-4'>
        <div className='flex items-start space-x-2'>
          <Checkbox
            id='terms'
            checked={watchedValues.termsAccepted}
            onCheckedChange={(checked) =>
              setValue("termsAccepted", checked as boolean)
            }
          />
          <div className='grid gap-1.5 leading-none'>
            <label
              htmlFor='terms'
              className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            >
              I accept the terms and conditions
            </label>
            <p className='text-sm text-muted-foreground'>
              I understand that additional costs may be incurred if additional
              issues are found during service.
            </p>
          </div>
        </div>
        {errors.termsAccepted && (
          <p className='text-red-500 text-sm mt-2'>
            {errors.termsAccepted.message}
          </p>
        )}
      </div>
    </motion.div>
  );
};
