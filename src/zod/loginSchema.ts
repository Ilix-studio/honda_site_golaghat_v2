import { z } from "zod";

/**
 * Shared login validation for phone-based admin/staff logins.
 * Phone must be a valid 10-digit Indian mobile number; inputs also cap entry
 * at 10 digits in the UI, so this is the final guard on submit.
 */
export const loginSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
