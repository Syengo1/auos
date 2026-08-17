import { z } from "zod";

// Validates the immutable global vehicle data
export const globalVehicleSchema = z.object({
  vin: z.string().min(5, "VIN/Chassis must be at least 5 characters"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().int().min(1980).max(new Date().getFullYear() + 1).optional(),
}); // <-- ADDED MISSING BRACES

// Validates the mutable local garage data
export const garageVehicleProfileSchema = z.object({
  registrationNumber: z.string().min(4, "Registration number is required"),
  color: z.string().optional(),
  currentMileage: z.number().int().nonnegative().optional(),
}); // <-- ADDED MISSING BRACES

// Used for the CSV Onboarding Pipeline
export const bulkImportVehicleSchema = z.array(
  globalVehicleSchema.merge(garageVehicleProfileSchema)
);