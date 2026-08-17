import { pgTable, uuid, varchar, timestamp, integer, text, jsonb, pgEnum, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { garages } from "./tenants.schema";

// --- ENUMS ---

// NEW: Polymorphic Category Enum
export const vehicleCategoryEnum = pgEnum("vehicle_category", [
  "passenger_car", 
  "motorcycle", 
  "commercial_van", // Supports matatus, delivery fleets
  "heavy_truck", 
  "machinery",      // Supports tractors, generators
  "other"
]);

export const fuelTypeEnum = pgEnum("fuel_type", ["petrol", "diesel", "hybrid", "electric"]);

export const verificationTierEnum = pgEnum("verification_tier", [
  "tier_1_authoritative", // NTSA, Insurers
  "tier_2_commercial",    // AutoOS Garages
  "tier_3_documented",    // Uploaded invoices/receipts
  "tier_4_user_entered"   // Owner declared
]);

export const eventTypeEnum = pgEnum("event_type", [
  "registration", "service", "repair", "inspection", "accident", "ownership_transfer"
]);

export const ownershipStatusEnum = pgEnum("ownership_status", [
  "active", "transferred", "pending_verification"
]);

// 1. THE TAXONOMY (Standardized Reference Data)
export const vehicleMakes = pgTable("vehicle_makes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).unique().notNull(),
  isVerified: boolean("is_verified").default(false).notNull(), 
});

export const vehicleModels = pgTable("vehicle_models", {
  id: uuid("id").defaultRandom().primaryKey(),
  makeId: uuid("make_id").references(() => vehicleMakes.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 50 }).notNull(), 
  isVerified: boolean("is_verified").default(false).notNull(),
});

// 2. THE VEHICLE LEDGER (The Immortal Physical Asset)
export const vehicles = pgTable("vehicles", {
  id: uuid("id").defaultRandom().primaryKey(),
  
  // EXPANDED: Increased lengths to handle special government/custom plates & heavy machinery serials
  registrationNumber: varchar("registration_number", { length: 50 }).unique().notNull(),
  vinChassisNumber: varchar("vin_chassis_number", { length: 100 }).unique().notNull(),
  
  // NEW: The Category mapping
  vehicleCategory: vehicleCategoryEnum("vehicle_category").default("passenger_car").notNull(),

  makeId: uuid("make_id").references(() => vehicleMakes.id).notNull(),
  modelId: uuid("model_id").references(() => vehicleModels.id).notNull(),
  
  yearOfManufacture: integer("year_of_manufacture"),
  engineCapacityCc: integer("engine_capacity_cc"),
  fuelType: fuelTypeEnum("fuel_type"),
  latestMileageKm: integer("latest_mileage_km").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 3. THE CHAIN OF CUSTODY (Access Control)
export const vehicleOwnership = pgTable("vehicle_ownership", {
  id: uuid("id").defaultRandom().primaryKey(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").notNull(), 
  status: ownershipStatusEnum("status").default("active").notNull(),
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
  transferredAt: timestamp("transferred_at"), 
});

// 4. THE EVENT GRAPH (The Data Moat)
export const vehicleEvents = pgTable("vehicle_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "cascade" }).notNull(),
  recordedById: uuid("recorded_by_id").notNull(), 
  garageId: uuid("garage_id").references(() => garages.id), 
  verificationTier: verificationTierEnum("verification_tier").default("tier_4_user_entered").notNull(),
  eventType: eventTypeEnum("event_type").notNull(),
  dateOfEvent: timestamp("date_of_event").notNull(),
  mileageAtEventKm: integer("mileage_at_event_km").notNull(),
  servicePayload: jsonb("service_payload"),  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- RELATIONS ---
export const vehicleMakesRelations = relations(vehicleMakes, ({ many }) => ({
  models: many(vehicleModels),
  vehicles: many(vehicles),
}));

export const vehicleModelsRelations = relations(vehicleModels, ({ one, many }) => ({
  make: one(vehicleMakes, {
    fields: [vehicleModels.makeId],
    references: [vehicleMakes.id],
  }),
  vehicles: many(vehicles),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  make: one(vehicleMakes, {
    fields: [vehicles.makeId],
    references: [vehicleMakes.id],
  }),
  model: one(vehicleModels, {
    fields: [vehicles.modelId],
    references: [vehicleModels.id],
  }),
  events: many(vehicleEvents),
  ownershipHistory: many(vehicleOwnership),
}));

export const vehicleOwnershipRelations = relations(vehicleOwnership, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [vehicleOwnership.vehicleId],
    references: [vehicles.id],
  }),
}));

export const vehicleEventsRelations = relations(vehicleEvents, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [vehicleEvents.vehicleId],
    references: [vehicles.id],
  }),
  garage: one(garages, {
    fields: [vehicleEvents.garageId],
    references: [garages.id],
  })
}));