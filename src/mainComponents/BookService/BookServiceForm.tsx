// src/components/service-booking/BookServiceForm.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ServiceFormValues, serviceFormSchema } from "@/lib/form-schema";
import { VehicleInformation } from "./formSteps/VehicleInformation";
import { ServiceSelection } from "./formSteps/ServiceSelection";
import { ScheduleService } from "./formSteps/ScheduleService";
import { CustomerInformation } from "./formSteps/CustomerInformation";
import { AdditionalInformation } from "./formSteps/AdditionalInformation";
import { BookingSummary } from "./formSteps/BookingSummary";
import { SuccessConfirmation } from "./SuccessConfirmation";
import { StepIndicator } from "./StepIndicator";
import { FormNavigation } from "./FormNavigation";

export const BookServiceForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const totalSteps = 6;

  // Initialize form with react-hook-form and zod validation
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      bikeModel: "",
      year: "",
      vin: "",
      mileage: "",
      registrationNumber: "",
      serviceType: "",
      additionalServices: [],
      serviceLocation: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      issues: "",
      dropOff: false,
      waitOnsite: false,
      termsAccepted: false,
    },
  });

  // Handle next step
  const handleNext = async () => {
    let fieldsToValidate: (keyof ServiceFormValues)[] = [];

    // Determine which fields to validate based on current step
    switch (step) {
      case 1:
        fieldsToValidate = ["bikeModel", "year", "mileage"];
        break;
      case 2:
        fieldsToValidate = ["serviceType"];
        break;
      case 3:
        fieldsToValidate = ["serviceLocation", "date", "time"];
        break;
      case 4:
        fieldsToValidate = ["firstName", "lastName", "email", "phone"];
        break;
      case 5:
        fieldsToValidate = ["termsAccepted"];
        break;
    }

    // Validate the fields for the current step
    const isValid = await form.trigger(fieldsToValidate as any);

    if (isValid) {
      if (step < totalSteps) {
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

  // Handle form reset
  const handleReset = () => {
    setIsSubmitted(false);
    setStep(1);
  };

  // Handle form submission
  const onSubmit = form.handleSubmit((data) => {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Form submitted:", data);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  });

  // Render appropriate step component
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <VehicleInformation form={form} />;
      case 2:
        return <ServiceSelection form={form} />;
      case 3:
        return <ScheduleService form={form} />;
      case 4:
        return <CustomerInformation form={form} />;
      case 5:
        return <AdditionalInformation form={form} />;
      case 6:
        return <BookingSummary form={form} />;
      default:
        return null;
    }
  };

  if (isSubmitted) {
    return <SuccessConfirmation form={form} onReset={handleReset} />;
  }

  return (
    <div className='max-w-3xl mx-auto'>
      <Card className='border-2'>
        <CardHeader>
          <CardTitle className='text-2xl'>Book a Service</CardTitle>
          <CardDescription>
            Schedule maintenance or repairs for your Honda motorcycle
          </CardDescription>
          <StepIndicator currentStep={step} totalSteps={totalSteps} />
        </CardHeader>

        <CardContent>
          <form>
            <AnimatePresence mode='wait'>{renderStepContent()}</AnimatePresence>
          </form>
        </CardContent>

        <CardFooter>
          <FormNavigation
            step={step}
            totalSteps={totalSteps}
            handleBack={handleBack}
            handleNext={handleNext}
            handleSubmit={onSubmit}
            isSubmitting={isSubmitting}
          />
        </CardFooter>
      </Card>
    </div>
  );
};
