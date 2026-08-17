import { z } from "zod";

// The Smart Plate Validator: Allows 3-15 chars (letters, numbers, spaces, and hyphens)
// Supports global formats, customized vanity plates, and local variations seamlessly.
const plateRegex = /^[A-Z0-9\s-]{3,15}$/i;

// The Smart Chassis Validator: Allows 5-25 chars (letters, numbers, and hyphens)
// Easily supports 11-character JDMs, motorcycles, classic cars, and standard 17-char VINs.
const chassisRegex = /^[A-Z0-9-]{5,25}$/i;

export const vehicleRegistrationSchema = z.object({
  registrationNumber: z.string()
    .min(3, "Plate must be at least 3 characters")
    .max(15, "Plate cannot exceed 15 characters")
    .regex(plateRegex, "Plate contains invalid characters. Use alphanumeric, spaces, or hyphens."),
    
  vin: z.string()
    .min(5, "VIN/Chassis must be at least 5 characters")
    .max(25, "VIN/Chassis cannot exceed 25 characters")
    .regex(chassisRegex, "VIN/Chassis contains invalid characters."),
    
  category: z.enum([
    "passenger_car", 
    "motorcycle", 
    "commercial_van", 
    "heavy_truck", 
    "machinery", 
    "other"
  ]),
  
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  
  year: z.number().int().min(1950).max(new Date().getFullYear() + 1).optional(),
  engineCapacityCc: z.number().int().positive().optional(),
  fuelType: z.enum(["petrol", "diesel", "hybrid", "electric"]).optional(),
  mileage: z.number().int().nonnegative().optional().default(0),
});