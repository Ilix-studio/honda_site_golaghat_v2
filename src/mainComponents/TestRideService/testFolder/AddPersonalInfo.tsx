import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepProps } from "../../../mockdata/data";

export const PersonalInfoStep = ({
  formData,
  updateFormData,
  errors,
  fadeInUp,
}: StepProps) => {
  return (
    <motion.div
      key='step1'
      initial='hidden'
      animate='visible'
      exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
      variants={fadeInUp}
      className='space-y-4'
    >
      <h3 className='text-lg font-medium'>Personal Information</h3>
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='firstName'>First Name</Label>
          <Input
            id='firstName'
            value={formData.firstName}
            onChange={(e) =>
              updateFormData && updateFormData("firstName", e.target.value)
            }
            className={errors?.firstName ? "border-red-500" : ""}
          />
          {errors?.firstName && (
            <p className='text-red-500 text-sm'>{errors.firstName}</p>
          )}
        </div>
        <div className='space-y-2'>
          <Label htmlFor='lastName'>Last Name</Label>
          <Input
            id='lastName'
            value={formData.lastName}
            onChange={(e) =>
              updateFormData && updateFormData("lastName", e.target.value)
            }
            className={errors?.lastName ? "border-red-500" : ""}
          />
          {errors?.lastName && (
            <p className='text-red-500 text-sm'>{errors.lastName}</p>
          )}
        </div>
      </div>
      <div className='space-y-2'>
        <Label htmlFor='email'>Email</Label>
        <Input
          id='email'
          type='email'
          value={formData.email}
          onChange={(e) =>
            updateFormData && updateFormData("email", e.target.value)
          }
          className={errors?.email ? "border-red-500" : ""}
        />
        {errors?.email && (
          <p className='text-red-500 text-sm'>{errors.email}</p>
        )}
      </div>
      <div className='space-y-2'>
        <Label htmlFor='phone'>Phone Number</Label>
        <Input
          id='phone'
          type='tel'
          value={formData.phone}
          onChange={(e) =>
            updateFormData && updateFormData("phone", e.target.value)
          }
          className={errors?.phone ? "border-red-500" : ""}
        />
        {errors?.phone && (
          <p className='text-red-500 text-sm'>{errors.phone}</p>
        )}
      </div>
    </motion.div>
  );
};
