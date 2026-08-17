import { pgTable, uuid, varchar, timestamp, boolean, integer, pgPolicy, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// --- ENUMS FOR RBAC ---
export const staffRoleEnum = pgEnum("staff_role", ["owner", "manager", "mechanic", "intern"]);
export const staffStatusEnum = pgEnum("staff_status", ["active", "suspended"]);

// 1. THE COMMERCIAL TENANT (B2B SaaS)
export const garages = pgTable("garages", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").unique().notNull(), 
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  contactEmail: varchar("contact_email", { length: 255 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 50 }),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  pgPolicy("garage_isolation_policy", {
    as: "permissive",
    for: "all",
    to: "authenticated",
    using: sql`${table.id} = current_setting('app.current_garage_id', true)::uuid`,
  })
]).enableRLS();

// 2. GARAGE METRICS (For the Data Quality Score flywheel)
export const garageMetrics = pgTable("garage_metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  garageId: uuid("garage_id").references(() => garages.id, { onDelete: "cascade" }).unique().notNull(),
  
  totalVehiclesServiced: integer("total_vehicles_serviced").default(0).notNull(),
  dataAccuracyScore: integer("data_accuracy_score").default(100).notNull(), // Starts at 100%, drops for anomalies
  isVerifiedPartner: boolean("is_verified_partner").default(false).notNull(),
  
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 3. THE DIGITAL VEHICLE PASSPORT OWNER (B2C Consumer)
export const driverProfiles = pgTable("driver_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").unique().notNull(), // Supabase Auth User ID
  
  fullName: varchar("full_name", { length: 255 }).notNull(),
  contactEmail: varchar("contact_email", { length: 255 }).unique().notNull(),
  contactPhone: varchar("contact_phone", { length: 20 }),
  
  // Privacy & Sharing Control (ODPC Compliance)
  allowAnonymousAnalytics: boolean("allow_anonymous_analytics").default(true).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 4. THE GARAGE STAFF (RBAC Mapping Table)
export const garageStaff = pgTable("garage_staff", {
  id: uuid("id").primaryKey().defaultRandom(),
  garageId: uuid("garage_id").notNull().references(() => garages.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull(), // Links to Supabase auth.users
  role: staffRoleEnum("role").notNull().default("mechanic"),
  status: staffStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});