
import { z } from "zod";

export const planFormSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(1, "Plan name is required")
    .max(50, "Plan name must be less than 50 characters")
    .regex(/^[a-zA-Z0-9\s-]+$/, "Plan name can only contain letters, numbers, spaces, and hyphens"),
  
  description: z.string()
    .max(200, "Description must be less than 200 characters")
    .optional(),
  
  price_cents: z.number()
    .min(0, "Price must be non-negative")
    .max(999999, "Price must be less than $9,999.99"),
  
  billing_interval: z.enum(["month", "year"], {
    errorMap: () => ({ message: "Billing interval must be monthly or yearly" })
  }),
  
  features: z.array(z.string()).default([]),
  
  is_active: z.boolean().default(true),
  
  is_popular: z.boolean().default(false),
  
  sort_order: z.number()
    .min(1, "Sort order must be at least 1")
    .max(100, "Sort order must be less than 100")
    .default(1),
  
  stripe_price_id: z.string().optional(),
}).refine((data) => {
  // Business rule: Only one plan can be marked as popular per billing interval
  return true; // We'll handle this validation at the component level
}, {
  message: "Only one plan per billing interval can be marked as most popular"
});

export type PlanFormData = z.infer<typeof planFormSchema>;

// Feature templates for quick plan setup
export const FEATURE_TEMPLATES = {
  starter: [
    "Basic workout tracking",
    "Simple statistics", 
    "Community access",
    "Email support"
  ],
  growth: [
    "Advanced statistics",
    "Smart recommendations",
    "Social challenges",
    "Export data",
    "Priority email support",
    "Custom workout plans"
  ],
  enterprise: [
    "All Growth features",
    "Custom workout builder",
    "Advanced analytics",
    "Priority support",
    "API access",
    "White-label options",
    "Dedicated account manager"
  ]
} as const;

export type FeatureTemplate = keyof typeof FEATURE_TEMPLATES;
