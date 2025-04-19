import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormData } from "../../mockdata/data";
import { PersonalInfoStep } from "./testFolder/AddPersonalInfo";
import { MotorcycleSelectionStep } from "./testFolder/SelectMoto";
import { ScheduleStep } from "./testFolder/ScheduleTime";
import { ExperienceStep } from "./testFolder/ExperienceStep";
import { SummaryStep } from "./testFolder/SummaryStep";
import { SuccessCard } from "./testFolder/SuccessCard";

// Initial form data
const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  bikeModel: "",
  dealership: "",
  date: undefined,
  time: "",
  licenseType: "",
  ridingExperience: "",
  additionalInfo: "",
  termsAccepted: false,
};

const TestRideForm = () => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Update form data
  const updateFormData = (fieldName: string, value: any) => {
    setFormData({
      ...formData,
      [fieldName]: value,
    });

    // Clear error for the field if it exists
    if (errors[fieldName]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[fieldName];
      setErrors(updatedErrors);
    }
  };

  // Validate current step
  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Personal Information
        if (!formData.firstName || formData.firstName.length < 2) {
          newErrors.firstName = "First name must be at least 2 characters";
        }
        if (!formData.lastName || formData.lastName.length < 2) {
          newErrors.lastName = "Last name must be at least 2 characters";
        }
        if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
          newErrors.email = "Please enter a valid email address";
        }
        if (!formData.phone || formData.phone.length < 10) {
          newErrors.phone = "Please enter a valid phone number";
        }
        break;

      case 2: // Motorcycle Selection
        if (!formData.bikeModel) {
          newErrors.bikeModel = "Please select a motorcycle model";
        }
        if (!formData.dealership) {
          newErrors.dealership = "Please select a dealership";
        }
        break;

      case 3: // Schedule
        if (!formData.date) {
          newErrors.date = "Please select a date";
        }
        if (!formData.time) {
          newErrors.time = "Please select a time";
        }
        break;

      case 4: // Experience
        if (!formData.licenseType) {
          newErrors.licenseType = "Please select your license type";
        }
        if (!formData.ridingExperience) {
          newErrors.ridingExperience = "Please select your riding experience";
        }
        if (!formData.termsAccepted) {
          newErrors.termsAccepted = "You must accept the terms and conditions";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      if (step < 5) {
        setStep(step + 1);
      }
    }
  };

  // Handle back step
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Form submitted:", formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className='max-w-3xl mx-auto'>
      {!isSubmitted ? (
        <Card className='border-2'>
          <CardHeader>
            <CardTitle className='text-2xl'>Schedule a Test Ride</CardTitle>
            <CardDescription>
              Experience the thrill of riding a Honda motorcycle
            </CardDescription>

            {/* Progress indicator */}
            <div className='mt-4'>
              <div className='flex justify-between mb-2'>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      step === i
                        ? "bg-red-600 text-white"
                        : step > i
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {i}
                  </div>
                ))}
              </div>
              <div className='w-full bg-gray-200 h-2 rounded-full'>
                <div
                  className='bg-red-600 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${(step - 1) * 25}%` }}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode='wait'>
              {step === 1 && (
                <PersonalInfoStep
                  formData={formData}
                  updateFormData={updateFormData}
                  errors={errors}
                  fadeInUp={fadeInUp}
                />
              )}

              {step === 2 && (
                <MotorcycleSelectionStep
                  formData={formData}
                  updateFormData={updateFormData}
                  errors={errors}
                  fadeInUp={fadeInUp}
                />
              )}

              {step === 3 && (
                <ScheduleStep
                  formData={formData}
                  updateFormData={updateFormData}
                  errors={errors}
                  fadeInUp={fadeInUp}
                />
              )}

              {step === 4 && (
                <ExperienceStep
                  formData={formData}
                  updateFormData={updateFormData}
                  errors={errors}
                  fadeInUp={fadeInUp}
                />
              )}

              {step === 5 && (
                <SummaryStep formData={formData} fadeInUp={fadeInUp} />
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className='flex justify-between'>
            {step > 1 && (
              <Button
                type='button'
                variant='outline'
                onClick={handleBack}
                disabled={isSubmitting}
              >
                <ChevronLeft className='mr-2 h-4 w-4' /> Back
              </Button>
            )}
            {step === 1 && <div />}

            {step < 5 ? (
              <Button
                type='button'
                onClick={handleNext}
                className='bg-red-600 hover:bg-red-700'
              >
                Next <ChevronRight className='ml-2 h-4 w-4' />
              </Button>
            ) : (
              <Button
                type='button'
                onClick={handleSubmit}
                className='bg-red-600 hover:bg-red-700'
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Schedule Test Ride"}
              </Button>
            )}
          </CardFooter>
        </Card>
      ) : (
        // <SuccessCard formData={formData} />
        <SuccessCard />
      )}
    </div>
  );
};

export default TestRideForm;
