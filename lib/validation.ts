import { z } from "zod";

// Deliberately strict-ish but not punishing: 10+ chars, at least one letter
// and one number. Length matters far more than character-class gymnastics.
const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters.")
  .max(200)
  .regex(/[A-Za-z]/, "Password must include at least one letter.")
  .regex(/[0-9]/, "Password must include at least one number.");

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const addressSchema = z.object({
  label: z.string().trim().min(1).max(50).default("Home"),
  fullName: z.string().trim().min(1, "Full name is required.").max(120),
  line1: z.string().trim().min(1, "Address is required.").max(200),
  line2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required.").max(100),
  region: z.string().trim().max(100).optional().or(z.literal("")),
  postalCode: z.string().trim().min(1, "Postal code is required.").max(20),
  country: z.string().trim().min(1, "Country is required.").max(100),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  comment: z.string().trim().min(1, "Please add a comment.").max(2000),
});

export const productSchema = z.object({
  name: z.string().trim().min(1).max(200),
  nameKa: z.string().trim().max(200).optional().or(z.literal("")),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only."),
  shortDescription: z.string().trim().min(1).max(300),
  shortDescriptionKa: z.string().trim().max(300).optional().or(z.literal("")),
  description: z.string().trim().min(1).max(5000),
  descriptionKa: z.string().trim().max(5000).optional().or(z.literal("")),
  categoryId: z.string().min(1, "Choose a category."),
  group: z.enum(["DECOR", "SMART_HOME"]),
  room: z.array(
    z.enum([
      "LIVING_ROOM",
      "BEDROOM",
      "KITCHEN",
      "BATHROOM",
      "ENTRYWAY",
      "OFFICE",
      "OUTDOOR",
      "WHOLE_HOME",
    ]),
  ),
  basePrice: z.coerce.number().int().min(0, "Price can't be negative."),
  compareAtPrice: z.coerce.number().int().min(0).optional(),
  images: z.array(z.string().url()).min(1, "Add at least one image URL."),
  materials: z.array(z.string()).default([]),
  materialsKa: z.array(z.string()).default([]),
  smartFeatures: z.array(z.string()).default([]),
  smartFeaturesKa: z.array(z.string()).default([]),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
});

export const chatMessageSchema = z.object({
  sessionId: z.string().optional(),
  message: z.string().trim().min(1).max(2000),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ProductInput = z.infer<typeof productSchema>;
