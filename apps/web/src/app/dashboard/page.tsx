import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { db } from "@/lib/db"
import { garages, driverProfiles, garageMetrics, garageStaff } from "@auto-os/db/src/schema/tenants.schema"
import { vehicleOwnership, vehicles, vehicleMakes, vehicleModels, vehicleEvents } from "@auto-os/db/src/schema/vehicles.schema"
import { eq, and, desc } from "drizzle-orm"
import { WelcomeModal } from "@/components/ui/welcome-modal"
import { GarageDashboard } from "@/components/garage-dashboard"
import { DriverDashboard } from "@/components/driver-dashboard"
import { StaffDashboard } from "@/components/staff/staff-dashboard"
import { cookies } from "next/headers"
import type { StaffMember, FleetVehicle } from "@/components/garage/garage-data-tabs"

type RecentEvent = {
  id: string;
  eventType: string;
  date: Date;
  regNumber: string;
  verificationTier: string;
}


type DriverVehicle = {
  id: string;
  regNumber: string;
  year: number | null;
  mileage: number | null;
  make: string;
  model: string;
  fuel: string | null;
}

// --- NEW: STRICT TYPES FOR VIEW COMPONENTS ---
type ActiveGarage = {
  id: string;
  name: string;
  slug: string;
  isVerified: boolean | null;
};

type ActiveStaffRecord = {
  staffInfo: { role: string; status: string; };
  workspace: { id: string; name: string; isVerified: boolean | null; };
};

type ActiveDriver = {
  fullName: string;
  contactEmail: string;
};

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 1. Fetch available identities
  const activeGarage = await db.select().from(garages).where(eq(garages.ownerId, user.id)).limit(1).then(res => res[0])
  const activeDriver = await db.select().from(driverProfiles).where(eq(driverProfiles.userId, user.id)).limit(1).then(res => res[0])
  const activeStaffRecord = await db
    .select({
      staffInfo: garageStaff,
      workspace: garages
    })
    .from(garageStaff)
    .innerJoin(garages, eq(garageStaff.garageId, garages.id))
    .where(eq(garageStaff.userId, user.id))
    .limit(1)
    .then(res => res[0])

  // 2. Read active cookie to determine what to render
  const cookieStore = await cookies()
  const savedWorkspaceId = cookieStore.get('autoos_active_workspace')?.value

  let activeRole: "garage_owner" | "garage_staff" | "driver" = "driver"
  if (savedWorkspaceId?.startsWith("owner_") && activeGarage) {
    activeRole = "garage_owner"
  } else if (savedWorkspaceId?.startsWith("staff_") && activeStaffRecord) {
    activeRole = "garage_staff"
  } else if (savedWorkspaceId?.startsWith("driver_") && activeDriver) {
    activeRole = "driver"
  } else {
    // Default fallback order: Owner > Staff > Driver
    if (activeGarage) activeRole = "garage_owner"
    else if (activeStaffRecord) activeRole = "garage_staff"
    else if (activeDriver) activeRole = "driver"
  }

  const firstName = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || "User"

  return (
    <>
      <WelcomeModal name={firstName} avatarUrl={user.user_metadata?.avatar_url || ""} />
      
      <div className="mx-auto max-w-6xl w-full">
        {/* RENDER STRICTLY ONE VIEW ACCORDING TO ACTIVE CONTEXT */}
        {activeRole === "garage_owner" && activeGarage && (
          <GarageOwnerView garage={activeGarage} />
        )}

        {activeRole === "garage_staff" && activeStaffRecord && (
          <StaffView staffRecord={activeStaffRecord} firstName={firstName} />
        )}

        {activeRole === "driver" && activeDriver && (
          <DriverView driver={activeDriver} userId={user.id} />
        )}
      </div>
    </>
  )
}

async function GarageOwnerView({ garage }: { garage: ActiveGarage }) {
  const metrics = await db.select().from(garageMetrics).where(eq(garageMetrics.garageId, garage.id)).limit(1).then(res => res[0])
  
  const recentEvents: RecentEvent[] = await db
    .select({ id: vehicleEvents.id, eventType: vehicleEvents.eventType, date: vehicleEvents.dateOfEvent, regNumber: vehicles.registrationNumber, verificationTier: vehicleEvents.verificationTier })
    .from(vehicleEvents).innerJoin(vehicles, eq(vehicleEvents.vehicleId, vehicles.id))
    .where(eq(vehicleEvents.garageId, garage.id)).orderBy(desc(vehicleEvents.dateOfEvent)).limit(5)
  
  const rawStaff = await db.select().from(garageStaff).where(eq(garageStaff.garageId, garage.id))
  const adminAuthClient = createAdminClient()
  
  const staffMembers: StaffMember[] = await Promise.all(rawStaff.map(async (record) => {
    const { data } = await adminAuthClient.auth.admin.getUserById(record.userId)
    return { id: record.id, name: data.user?.user_metadata?.full_name || "Unknown", email: data.user?.email || "", role: record.role, status: record.status }
  }))

  const fleetVehicles: FleetVehicle[] = await db
    .select({ id: vehicles.id, regNumber: vehicles.registrationNumber, make: vehicleMakes.name, model: vehicleModels.name })
    .from(vehicleEvents).innerJoin(vehicles, eq(vehicleEvents.vehicleId, vehicles.id)).innerJoin(vehicleMakes, eq(vehicles.makeId, vehicleMakes.id)).innerJoin(vehicleModels, eq(vehicles.modelId, vehicleModels.id))
    .where(eq(vehicleEvents.garageId, garage.id)).groupBy(vehicles.id, vehicles.registrationNumber, vehicleMakes.name, vehicleModels.name)

  return <GarageDashboard garage={garage} metrics={metrics} recentEvents={recentEvents} staffMembers={staffMembers} fleetVehicles={fleetVehicles} />
}

async function StaffView({ staffRecord, firstName }: { staffRecord: ActiveStaffRecord; firstName: string }) {
  const recentEvents: RecentEvent[] = await db
    .select({ id: vehicleEvents.id, eventType: vehicleEvents.eventType, date: vehicleEvents.dateOfEvent, regNumber: vehicles.registrationNumber, verificationTier: vehicleEvents.verificationTier })
    .from(vehicleEvents).innerJoin(vehicles, eq(vehicleEvents.vehicleId, vehicles.id))
    .where(eq(vehicleEvents.garageId, staffRecord.workspace.id)).orderBy(desc(vehicleEvents.dateOfEvent)).limit(10)

  return <StaffDashboard staffRecord={staffRecord} recentEvents={recentEvents} userName={firstName} />
}

async function DriverView({ driver, userId }: { driver: ActiveDriver; userId: string }) {
  const driverVehicles: DriverVehicle[] = await db
    .select({ id: vehicles.id, regNumber: vehicles.registrationNumber, year: vehicles.yearOfManufacture, mileage: vehicles.latestMileageKm, make: vehicleMakes.name, model: vehicleModels.name, fuel: vehicles.fuelType })
    .from(vehicleOwnership).innerJoin(vehicles, eq(vehicleOwnership.vehicleId, vehicles.id)).innerJoin(vehicleMakes, eq(vehicles.makeId, vehicleMakes.id)).innerJoin(vehicleModels, eq(vehicles.modelId, vehicleModels.id))
    .where(and(eq(vehicleOwnership.userId, userId), eq(vehicleOwnership.status, "active")))

  return <DriverDashboard profile={driver} vehicles={driverVehicles} />
}