import { motion } from "framer-motion";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ServiceFormValues } from "../../../lib/form-schema";

interface CustomerInformationProps {
  form: UseFormReturn<ServiceFormValues>;
}

export function CustomerInformation({ form }: CustomerInformationProps) {
  const {
    register,
    formState: { errors },
  } = form;

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      key='step4'
      initial='hidden'
      animate='visible'
      exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
      variants={fadeInUp}
      className='space-y-4'
    >
      <h3 className='text-lg font-medium'>Customer Information</h3>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='firstName'>First Name</Label>
          <Input
            id='firstName'
            {...register("firstName")}
            className={errors.firstName ? "border-red-500" : ""}
          />
          {errors.firstName && (
            <p className='text-red-500 text-sm'>{errors.firstName.message}</p>
          )}
        </div>
        <div className='space-y-2'>
          <Label htmlFor='lastName'>Last Name</Label>
          <Input
            id='lastName'
            {...register("lastName")}
            className={errors.lastName ? "border-red-500" : ""}
          />
          {errors.lastName && (
            <p className='text-red-500 text-sm'>{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='email'>Email</Label>
        <Input
          id='email'
          type='email'
          {...register("email")}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className='text-red-500 text-sm'>{errors.email.message}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='phone'>Phone Number</Label>
        <Input
          id='phone'
          type='tel'
          {...register("phone")}
          className={errors.phone ? "border-red-500" : ""}
        />
        {errors.phone && (
          <p className='text-red-500 text-sm'>{errors.phone.message}</p>
        )}
      </div>
    </motion.div>
  );
}
