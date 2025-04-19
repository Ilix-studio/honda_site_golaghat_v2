// src/lib/form-schema.ts
import * as z from "zod";

// Form schema for validation
export const serviceFormSchema = z.object({
  // Step 1: Vehicle Information
  bikeModel: z.string({
    required_error: "Please select your motorcycle model",
  }),
  year: z
    .string()
    .regex(/^\d{4}$/, { message: "Please enter a valid year (e.g., 2023)" }),
  vin: z.string().optional(),
  mileage: z.string().min(1, { message: "Please enter the current mileage" }),
  registrationNumber: z.string().optional(),

  // Step 2: Service Selection
  serviceType: z.string({ required_error: "Please select a service type" }),
  additionalServices: z.array(z.string()).optional(),

  // Step 3: Schedule
  serviceLocation: z.string({
    required_error: "Please select a service location",
  }),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string({ required_error: "Please select a time" }),

  // Step 4: Customer Information
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),

  // Step 5: Additional Information
  issues: z.string().optional(),
  dropOff: z.boolean().optional(),
  waitOnsite: z.boolean().optional(),

  // Terms
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
