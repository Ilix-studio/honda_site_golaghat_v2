import React from "react";
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

// Redux
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  selectServiceBookingForm,
  setServiceBookingStep,
  updateServiceBookingData,
  setServiceBookingSubmitting,
  setServiceBookingSubmitted,
  resetServiceBookingForm,
} from "../../redux-store/slices/formSlice";
import { addNotification } from "../../redux-store/slices/uiSlice";

export const BookServiceForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentStep, totalSteps, isSubmitting, isSubmitted, formData } =
    useAppSelector(selectServiceBookingForm);

  // Convert Redux form data to match Zod schema types
  const getFormDefaultValues = (): Partial<ServiceFormValues> => {
    return {
      bikeModel: formData.bikeModel,
      year: formData.year,
      vin: formData.vin,
      mileage: formData.mileage,
      registrationNumber: formData.registrationNumber,
      serviceType: formData.serviceType,
      additionalServices: formData.additionalServices,
      serviceLocation: formData.serviceLocation,
      // Convert string date to Date object for the form
      date: formData.date ? new Date(formData.date) : undefined,
      time: formData.time,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      issues: formData.issues,
      dropOff: formData.dropOff,
      waitOnsite: formData.waitOnsite,
      termsAccepted: formData.termsAccepted,
    };
  };

  // Initialize form with react-hook-form and zod validation
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: getFormDefaultValues(),
  });

  // Handle next step
  const handleNext = async () => {
    let fieldsToValidate: (keyof ServiceFormValues)[] = [];

    // Determine which fields to validate based on current step
    switch (currentStep) {
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
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      // Get current form data and convert Date to string for Redux
      const currentData = form.getValues();
      const reduxData = {
        ...currentData,
        // Convert Date back to string for Redux storage
        date: currentData.date ? currentData.date.toISOString() : null,
      };

      dispatch(updateServiceBookingData(reduxData));

      if (currentStep < totalSteps) {
        dispatch(setServiceBookingStep(currentStep + 1));
      }
    }
  };

  // Handle back step
  const handleBack = () => {
    if (currentStep > 1) {
      dispatch(setServiceBookingStep(currentStep - 1));
    }
  };

  // Handle form reset
  const handleReset = () => {
    dispatch(resetServiceBookingForm());
    form.reset();
  };

  // Handle form submission
  const onSubmit = form.handleSubmit(async (data: ServiceFormValues) => {
    dispatch(setServiceBookingSubmitting(true));

    // Convert Date to string for Redux storage
    const reduxData = {
      ...data,
      date: data.date ? data.date.toISOString() : null,
    };

    dispatch(updateServiceBookingData(reduxData));

    try {
      // Here you would make an actual API call
      // Example: await submitServiceBooking(data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      dispatch(setServiceBookingSubmitted(true));
      dispatch(
        addNotification({
          type: "success",
          message: "Service booking submitted successfully!",
        })
      );
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          message: "Failed to submit service booking. Please try again.",
        })
      );
    } finally {
      dispatch(setServiceBookingSubmitting(false));
    }
  });

  // Render appropriate step component
  const renderStepContent = () => {
    switch (currentStep) {
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
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        </CardHeader>

        <CardContent>
          <form>
            <AnimatePresence mode='wait'>{renderStepContent()}</AnimatePresence>
          </form>
        </CardContent>

        <CardFooter>
          <FormNavigation
            step={currentStep}
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
