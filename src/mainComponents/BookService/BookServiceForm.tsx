import React, { useEffect } from "react";
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
import { AdditionalInformation } from "./formSteps/AdditionalInformation";
import { SuccessConfirmation } from "./SuccessConfirmation";
import { StepIndicator } from "./StepIndicator";
import { FormNavigation } from "./FormNavigation";

// Redux
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { addNotification } from "../../redux-store/slices/uiSlice";
import {
  useCreateServiceBookingMutation,
  useGetMyServiceStatsQuery,
} from "@/redux-store/services/customer/ServiceBookCustomerApi";
import {
  clearCurrentBooking,
  nextStep,
  previousStep,
  setBookingError,
  setBookingSuccess,
  setCreatingBooking,
  setLastBookingId,
  updateCurrentBooking,
} from "@/redux-store/slices/bookingServiceSlice";

export const BookServiceForm: React.FC = () => {
  const dispatch = useAppDispatch();

  // Direct state access instead of selectors
  const serviceBooking = useAppSelector((state: any) => state.serviceBooking);
  const currentBooking = serviceBooking.currentBooking;
  const currentStep = serviceBooking.currentStep;
  const isCreating = serviceBooking.isCreatingBooking;
  const success = serviceBooking.bookingSuccess;

  // API hooks
  const [createServiceBooking] = useCreateServiceBookingMutation();
  const { refetch: refetchStats } = useGetMyServiceStatsQuery();

  const totalSteps = 4;

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      bikeModel: currentBooking?.vehicle,
      serviceType: currentBooking?.serviceType,
      serviceLocation: currentBooking?.branch,
      date: currentBooking?.appointmentDate
        ? new Date(currentBooking.appointmentDate)
        : undefined,
      time: currentBooking?.appointmentTime,
      termsAccepted: currentBooking?.termsAccepted,
    },
  });

  // Sync form with Redux state
  useEffect(() => {
    const subscription = form.watch((value) => {
      dispatch(
        updateCurrentBooking({
          vehicle: value.bikeModel,
          serviceType: value.serviceType,
          branch: value.serviceLocation,
          appointmentDate: value.date?.toISOString(),
          appointmentTime: value.time,
          location: value.serviceLocation ? "branch" : undefined,
          termsAccepted: value.termsAccepted,
        })
      );
    });
    return () => subscription.unsubscribe();
  }, [form, dispatch]);

  const handleNext = async () => {
    let fieldsToValidate: (keyof ServiceFormValues)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["bikeModel"];
        break;
      case 2:
        fieldsToValidate = ["serviceType"];
        break;
      case 3:
        fieldsToValidate = ["serviceLocation", "date", "time"];
        break;
      case 4:
        fieldsToValidate = ["termsAccepted"];
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid && currentStep < totalSteps) {
      dispatch(nextStep());
    }
  };

  const handleBack = () => {
    if (currentStep > 1) dispatch(previousStep());
  };

  const handleReset = () => {
    dispatch(clearCurrentBooking());
    form.reset();
  };

  const onSubmit = form.handleSubmit(async (data: ServiceFormValues) => {
    dispatch(setCreatingBooking(true));

    try {
      const bookingData = {
        vehicle: data.bikeModel!,
        serviceType: data.serviceType!,
        branch: data.serviceLocation!,
        appointmentDate: data.date!.toISOString().split("T")[0],
        appointmentTime: data.time!,
        location: "branch" as const,
        specialRequests: data.issues,
        isDropOff: data.dropOff,
        willWaitOnsite: data.waitOnsite,
        termsAccepted: true,
      };

      const result = await createServiceBooking(bookingData).unwrap();

      dispatch(setLastBookingId(result.data.bookingId));
      dispatch(setBookingSuccess(true));
      dispatch(
        addNotification({
          type: "success",
          message: `Service booking created successfully! Booking ID: ${result.data.bookingId}`,
        })
      );

      refetchStats();
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || "Failed to create service booking";
      dispatch(setBookingError(errorMessage));
      dispatch(
        addNotification({
          type: "error",
          message: errorMessage,
        })
      );
    } finally {
      dispatch(setCreatingBooking(false));
    }
  });

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <VehicleInformation form={form} />;
      case 2:
        return <ServiceSelection form={form} />;
      case 3:
        return <ScheduleService form={form} />;
      case 4:
        return <AdditionalInformation form={form} />;
      default:
        return null;
    }
  };

  if (success) {
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
            isSubmitting={isCreating}
          />
        </CardFooter>
      </Card>
    </div>
  );
};
