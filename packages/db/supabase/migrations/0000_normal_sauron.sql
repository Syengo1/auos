CREATE TYPE "public"."dvi_status" AS ENUM('green', 'yellow', 'red');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('diagnostic', 'pending_approval', 'in_progress', 'completed', 'paid', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."line_item_type" AS ENUM('labor', 'part', 'consumable', 'sublet');--> statement-breakpoint
CREATE TYPE "public"."staff_role" AS ENUM('owner', 'manager', 'mechanic', 'intern');--> statement-breakpoint
CREATE TYPE "public"."staff_status" AS ENUM('active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('registration', 'service', 'repair', 'inspection', 'accident', 'ownership_transfer');--> statement-breakpoint
CREATE TYPE "public"."fuel_type" AS ENUM('petrol', 'diesel', 'hybrid', 'electric');--> statement-breakpoint
CREATE TYPE "public"."ownership_status" AS ENUM('active', 'transferred', 'pending_verification');--> statement-breakpoint
CREATE TYPE "public"."vehicle_category" AS ENUM('passenger_car', 'motorcycle', 'commercial_van', 'heavy_truck', 'machinery', 'other');--> statement-breakpoint
CREATE TYPE "public"."verification_tier" AS ENUM('tier_1_authoritative', 'tier_2_commercial', 'tier_3_documented', 'tier_4_user_entered');--> statement-breakpoint
CREATE TABLE "digital_inspections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"mechanic_id" uuid NOT NULL,
	"category" varchar(100) NOT NULL,
	"item" varchar(255) NOT NULL,
	"status" "dvi_status" NOT NULL,
	"notes" text,
	"image_urls" jsonb DEFAULT '[]' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"service_advisor_id" uuid NOT NULL,
	"status" "job_status" DEFAULT 'diagnostic' NOT NULL,
	"mileage_in" integer NOT NULL,
	"mileage_out" integer,
	"client_notes" text,
	"internal_notes" text,
	"total_labor" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total_parts" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total_consumables" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total_sublet" numeric(12, 2) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"grand_total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"approved_at" timestamp,
	"paid_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "job_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"item_type" "line_item_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"inventory_id" uuid,
	"cost_price" numeric(12, 2) NOT NULL,
	"selling_price" numeric(12, 2) NOT NULL,
	"quantity" numeric(10, 2) DEFAULT '1' NOT NULL,
	"mechanic_id" uuid,
	"is_approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "driver_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"contact_email" varchar(255) NOT NULL,
	"contact_phone" varchar(20),
	"allow_anonymous_analytics" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "driver_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "driver_profiles_contact_email_unique" UNIQUE("contact_email")
);
--> statement-breakpoint
CREATE TABLE "garage_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"total_vehicles_serviced" integer DEFAULT 0 NOT NULL,
	"data_accuracy_score" integer DEFAULT 100 NOT NULL,
	"is_verified_partner" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "garage_metrics_garage_id_unique" UNIQUE("garage_id")
);
--> statement-breakpoint
CREATE TABLE "garage_staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "staff_role" DEFAULT 'mechanic' NOT NULL,
	"status" "staff_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "garages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"contact_email" varchar(255) NOT NULL,
	"contact_phone" varchar(50),
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "garages_owner_id_unique" UNIQUE("owner_id"),
	CONSTRAINT "garages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "garages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "vehicle_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"recorded_by_id" uuid NOT NULL,
	"garage_id" uuid,
	"verification_tier" "verification_tier" DEFAULT 'tier_4_user_entered' NOT NULL,
	"event_type" "event_type" NOT NULL,
	"date_of_event" timestamp NOT NULL,
	"mileage_at_event_km" integer NOT NULL,
	"service_payload" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle_makes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	CONSTRAINT "vehicle_makes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "vehicle_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"make_id" uuid NOT NULL,
	"name" varchar(50) NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle_ownership" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "ownership_status" DEFAULT 'active' NOT NULL,
	"claimed_at" timestamp DEFAULT now() NOT NULL,
	"transferred_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_number" varchar(50) NOT NULL,
	"vin_chassis_number" varchar(100) NOT NULL,
	"vehicle_category" "vehicle_category" DEFAULT 'passenger_car' NOT NULL,
	"make_id" uuid NOT NULL,
	"model_id" uuid NOT NULL,
	"year_of_manufacture" integer,
	"engine_capacity_cc" integer,
	"fuel_type" "fuel_type",
	"latest_mileage_km" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vehicles_registration_number_unique" UNIQUE("registration_number"),
	CONSTRAINT "vehicles_vin_chassis_number_unique" UNIQUE("vin_chassis_number")
);
--> statement-breakpoint
ALTER TABLE "digital_inspections" ADD CONSTRAINT "digital_inspections_job_id_job_cards_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digital_inspections" ADD CONSTRAINT "digital_inspections_mechanic_id_garage_staff_user_id_fk" FOREIGN KEY ("mechanic_id") REFERENCES "public"."garage_staff"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_cards" ADD CONSTRAINT "job_cards_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_cards" ADD CONSTRAINT "job_cards_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_cards" ADD CONSTRAINT "job_cards_service_advisor_id_garage_staff_user_id_fk" FOREIGN KEY ("service_advisor_id") REFERENCES "public"."garage_staff"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_line_items" ADD CONSTRAINT "job_line_items_job_id_job_cards_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_line_items" ADD CONSTRAINT "job_line_items_mechanic_id_garage_staff_user_id_fk" FOREIGN KEY ("mechanic_id") REFERENCES "public"."garage_staff"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garage_metrics" ADD CONSTRAINT "garage_metrics_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garage_staff" ADD CONSTRAINT "garage_staff_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_events" ADD CONSTRAINT "vehicle_events_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_events" ADD CONSTRAINT "vehicle_events_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_models" ADD CONSTRAINT "vehicle_models_make_id_vehicle_makes_id_fk" FOREIGN KEY ("make_id") REFERENCES "public"."vehicle_makes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_ownership" ADD CONSTRAINT "vehicle_ownership_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_make_id_vehicle_makes_id_fk" FOREIGN KEY ("make_id") REFERENCES "public"."vehicle_makes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_model_id_vehicle_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."vehicle_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "garage_isolation_policy" ON "garages" AS PERMISSIVE FOR ALL TO "authenticated" USING ("garages"."id" = current_setting('app.current_garage_id', true)::uuid);