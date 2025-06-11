import { z } from "zod";

// Form schema
export const bikeSchema = z.object({
  modelName: z.string().min(1, "Model name is required"),
  category: z.enum([
    "sport",
    "adventure",
    "cruiser",
    "touring",
    "naked",
    "electric",
  ]),
  year: z
    .number()
    .min(2000)
    .max(new Date().getFullYear() + 1),
  price: z.number().min(1, "Price must be greater than 0"),
  engine: z.string().min(1, "Engine details are required"),
  power: z.number().min(1, "Power is required"),
  transmission: z.string().min(1, "Transmission details are required"),
  features: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  inStock: z.boolean().optional(),
  quantity: z.number().min(0).optional(),
  branch: z.string().min(1, "Branch is required"),
});
