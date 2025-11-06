// src/lib/form-schema.ts
import * as z from "zod";

// Form schema for validation
export const serviceFormSchema = z.object({
  // Step 1: Vehicle Information
  bikeModel: z.string({
    required_error: "Please select your motorcycle model",
  }),
  mileage: z.string().min(1, { message: "Please enter the current mileage" }),
  // Step 2: Service Selection
  serviceType: z.string({ required_error: "Please select a service type" }),
  additionalServices: z.array(z.string()).optional(),

  // Step 3: Schedule
  serviceLocation: z.string({
    required_error: "Please select a service location",
  }),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string({ required_error: "Please select a time" }),

  // Step 4: Additional Information
  issues: z.string().optional(),
  dropOff: z.boolean().optional(),
  waitOnsite: z.boolean().optional(),

  // Terms
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
