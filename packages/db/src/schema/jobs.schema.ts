import { pgTable, uuid, varchar, timestamp, integer, text, jsonb, pgEnum, boolean, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { garages, garageStaff } from "./tenants.schema";
import { vehicles } from "./vehicles.schema";

// --- STRICT STATE MACHINE ENUMS ---

// The Immutable Job Lifecycle
export const jobStatusEnum = pgEnum("job_status", [
  "diagnostic",       // DVI phase. Cannot add parts.
  "pending_approval", // Estimate sent to client. Locked.
  "in_progress",      // Approved. Mechanics actively executing.
  "completed",        // Work finished, QC passed, invoice ready.
  "paid",             // Funds cleared. Cryptographically locked.
  "cancelled"         // Voided. Requires supervisor notes.
]);

// DVI Status Markers
export const dviStatusEnum = pgEnum("dvi_status", [
  "green",  // Good condition
  "yellow", // Monitor / Recommend future service
  "red"     // Critical / Immediate replacement required
]);

// The Financial Ledger Line Items
export const lineItemTypeEnum = pgEnum("line_item_type", [
  "labor",
  "part",
  "consumable",
  "sublet"
]);

// 1. THE PARENT JOB CARD
export const jobCards = pgTable("job_cards", {
  id: uuid("id").defaultRandom().primaryKey(),
  garageId: uuid("garage_id").references(() => garages.id, { onDelete: "cascade" }).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "restrict" }).notNull(),
  
  // FIX: Reference the specific staff profile ID, ensuring perfect tenant isolation
  serviceAdvisorId: uuid("service_advisor_id").references(() => garageStaff.id).notNull(), 
  
  status: jobStatusEnum("status").default("diagnostic").notNull(),
  
  mileageIn: integer("mileage_in").notNull(),
  mileageOut: integer("mileage_out"), // Set when status hits 'completed'
  
  clientNotes: text("client_notes"), // What the client complained about
  internalNotes: text("internal_notes"), // Hidden from client
  
  // Financial Rollups (Calculated and cached to prevent expensive sub-queries)
  totalLabor: numeric("total_labor", { precision: 12, scale: 2 }).default("0").notNull(),
  totalParts: numeric("total_parts", { precision: 12, scale: 2 }).default("0").notNull(),
  totalConsumables: numeric("total_consumables", { precision: 12, scale: 2 }).default("0").notNull(),
  totalSublet: numeric("total_sublet", { precision: 12, scale: 2 }).default("0").notNull(),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 }).default("0").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"), // Client signature timestamp
  paidAt: timestamp("paid_at")
});

// 2. DIGITAL VEHICLE INSPECTIONS (The Proof Engine)
export const digitalInspections = pgTable("digital_inspections", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobId: uuid("job_id").references(() => jobCards.id, { onDelete: "cascade" }).notNull(),
  
  // FIX: Reference the specific staff profile ID
  mechanicId: uuid("mechanic_id").references(() => garageStaff.id).notNull(),
  
  category: varchar("category", { length: 100 }).notNull(), // e.g., 'Brakes', 'Suspension', 'Fluids'
  item: varchar("item", { length: 255 }).notNull(), // e.g., 'Front Brake Pads'
  
  status: dviStatusEnum("status").notNull(),
  notes: text("notes"),
  imageUrls: jsonb("image_urls").default("[]").notNull(), // Array of Supabase Storage URLs
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. THE FINANCIAL LEDGER (Line Items)
export const jobLineItems = pgTable("job_line_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobId: uuid("job_id").references(() => jobCards.id, { onDelete: "cascade" }).notNull(),
  
  itemType: lineItemTypeEnum("item_type").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  
  // Future-proofing for Inventory module
  inventoryId: uuid("inventory_id"), // Will reference an inventory table later
  
  // The Margins
  costPrice: numeric("cost_price", { precision: 12, scale: 2 }).notNull(), 
  sellingPrice: numeric("selling_price", { precision: 12, scale: 2 }).notNull(), 
  quantity: numeric("quantity", { precision: 10, scale: 2 }).default("1").notNull(), 
  
  // Accountability
  // FIX: Reference the specific staff profile ID
  mechanicId: uuid("mechanic_id").references(() => garageStaff.id), 
  
  isApproved: boolean("is_approved").default(false).notNull(), 
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- RELATIONS ---

export const jobCardsRelations = relations(jobCards, ({ one, many }) => ({
  garage: one(garages, { fields: [jobCards.garageId], references: [garages.id] }),
  vehicle: one(vehicles, { fields: [jobCards.vehicleId], references: [vehicles.id] }),
  serviceAdvisor: one(garageStaff, { fields: [jobCards.serviceAdvisorId], references: [garageStaff.id] }), // FIXED
  inspections: many(digitalInspections),
  lineItems: many(jobLineItems),
}));

export const digitalInspectionsRelations = relations(digitalInspections, ({ one }) => ({
  job: one(jobCards, { fields: [digitalInspections.jobId], references: [jobCards.id] }),
  mechanic: one(garageStaff, { fields: [digitalInspections.mechanicId], references: [garageStaff.id] }), // FIXED
}));

export const jobLineItemsRelations = relations(jobLineItems, ({ one }) => ({
  job: one(jobCards, { fields: [jobLineItems.jobId], references: [jobCards.id] }),
  mechanic: one(garageStaff, { fields: [jobLineItems.mechanicId], references: [garageStaff.id] }), // FIXED
}));