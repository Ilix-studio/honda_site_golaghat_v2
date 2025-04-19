import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { StepProps } from "@/mockdata/data";

export const ExperienceStep = ({
  formData,
  updateFormData,
  errors,
  fadeInUp,
}: StepProps) => {
  return (
    <motion.div
      key='step4'
      initial='hidden'
      animate='visible'
      exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
      variants={fadeInUp}
      className='space-y-4'
    >
      <h3 className='text-lg font-medium'>Riding Experience</h3>
      <div className='space-y-2'>
        <Label>License Type</Label>
        <RadioGroup
          value={formData.licenseType}
          onValueChange={(value) =>
            updateFormData && updateFormData("licenseType", value)
          }
          className='grid grid-cols-1 gap-2'
        >
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='full' id='license-full' />
            <Label htmlFor='license-full' className='cursor-pointer'>
              Full Motorcycle License
            </Label>
          </div>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='provisional' id='license-provisional' />
            <Label htmlFor='license-provisional' className='cursor-pointer'>
              Provisional/Learner License
            </Label>
          </div>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='international' id='license-international' />
            <Label htmlFor='license-international' className='cursor-pointer'>
              International License
            </Label>
          </div>
        </RadioGroup>
        {errors?.licenseType && (
          <p className='text-red-500 text-sm'>{errors.licenseType}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label>Riding Experience</Label>
        <RadioGroup
          value={formData.ridingExperience}
          onValueChange={(value) =>
            updateFormData && updateFormData("ridingExperience", value)
          }
          className='grid grid-cols-1 gap-2'
        >
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='beginner' id='exp-beginner' />
            <Label htmlFor='exp-beginner' className='cursor-pointer'>
              Beginner (0-2 years)
            </Label>
          </div>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='intermediate' id='exp-intermediate' />
            <Label htmlFor='exp-intermediate' className='cursor-pointer'>
              Intermediate (2-5 years)
            </Label>
          </div>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='experienced' id='exp-experienced' />
            <Label htmlFor='exp-experienced' className='cursor-pointer'>
              Experienced (5+ years)
            </Label>
          </div>
        </RadioGroup>
        {errors?.ridingExperience && (
          <p className='text-red-500 text-sm'>{errors.ridingExperience}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='additionalInfo'>
          Additional Information (Optional)
        </Label>
        <Textarea
          id='additionalInfo'
          placeholder='Any specific questions or requirements for your test ride?'
          value={formData.additionalInfo}
          onChange={(e) =>
            updateFormData && updateFormData("additionalInfo", e.target.value)
          }
        />
      </div>

      <div className='pt-4'>
        <div className='flex items-start space-x-2'>
          <Checkbox
            id='terms'
            checked={formData.termsAccepted}
            onCheckedChange={(checked) =>
              updateFormData &&
              updateFormData("termsAccepted", checked as boolean)
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
              I confirm that I have a valid motorcycle license and will bring it
              with me to the test ride.
            </p>
          </div>
        </div>
        {errors?.termsAccepted && (
          <p className='text-red-500 text-sm mt-2'>{errors.termsAccepted}</p>
        )}
      </div>
    </motion.div>
  );
};
