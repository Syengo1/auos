CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone_number" varchar(50),
	"email" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "garages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"contact_email" varchar(255) NOT NULL,
	"contact_phone" varchar(50),
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "garages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "garage_vehicle_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"garage_id" uuid NOT NULL,
	"global_vehicle_id" uuid NOT NULL,
	"customer_id" uuid,
	"registration_number" varchar(20) NOT NULL,
	"color" varchar(50),
	"current_mileage" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "global_vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vin" varchar(50) NOT NULL,
	"make" varchar(100) NOT NULL,
	"model" varchar(100) NOT NULL,
	"year" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "global_vehicles_vin_unique" UNIQUE("vin")
);
--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garage_vehicle_profiles" ADD CONSTRAINT "garage_vehicle_profiles_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garage_vehicle_profiles" ADD CONSTRAINT "garage_vehicle_profiles_global_vehicle_id_global_vehicles_id_fk" FOREIGN KEY ("global_vehicle_id") REFERENCES "public"."global_vehicles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garage_vehicle_profiles" ADD CONSTRAINT "garage_vehicle_profiles_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;