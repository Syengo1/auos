import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin" // 1. IMPORT SECURE ADMIN CLIENT
import { db } from "@/lib/db"
import { garages, driverProfiles, garageMetrics, garageStaff } from "@auto-os/db/src/schema/tenants.schema"
import { vehicleOwnership, vehicles, vehicleMakes, vehicleModels, vehicleEvents } from "@auto-os/db/src/schema/vehicles.schema"
import { eq, and, desc } from "drizzle-orm"
import { WelcomeModal } from "@/components/ui/welcome-modal"
import { GarageDashboard } from "@/components/garage-dashboard"
import { DriverDashboard } from "@/components/driver-dashboard"
import { StaffDashboard } from "@/components/staff/staff-dashboard"
import type { StaffMember, FleetVehicle } from "@/components/garage/garage-data-tabs"

type RecentEvent = {
  id: string;
  eventType: string;
  date: Date;
  regNumber: string;
  verificationTier: string;
};

type DriverVehicle = {
  id: string;
  regNumber: string;
  year: number | null;
  mileage: number | null;
  make: string;
  model: string;
  fuel: string | null;
};

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 2. FETCH ALL IDENTITIES
  const activeGarage = await db.select().from(garages).where(eq(garages.ownerId, user.id)).limit(1).then(res => res[0])
  const activeDriver = await db.select().from(driverProfiles).where(eq(driverProfiles.userId, user.id)).limit(1).then(res => res[0])
  
  // NEW: Fetch Staff Record
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

  // --- GARAGE OWNER PIPELINE ---
  let metrics = undefined
  let recentGarageEvents: RecentEvent[] = []
  let staffMembers: StaffMember[] = []
  let fleetVehicles: FleetVehicle[] = []
  
  // We only run the heavy Owner queries if they are the actual owner
  if (activeGarage) {
    metrics = await db.select().from(garageMetrics).where(eq(garageMetrics.garageId, activeGarage.id)).limit(1).then(res => res[0])
    
    recentGarageEvents = await db
      .select({ id: vehicleEvents.id, eventType: vehicleEvents.eventType, date: vehicleEvents.dateOfEvent, regNumber: vehicles.registrationNumber, verificationTier: vehicleEvents.verificationTier })
      .from(vehicleEvents).innerJoin(vehicles, eq(vehicleEvents.vehicleId, vehicles.id))
      .where(eq(vehicleEvents.garageId, activeGarage.id)).orderBy(desc(vehicleEvents.dateOfEvent)).limit(5)

    const rawStaffRecords = await db.select().from(garageStaff).where(eq(garageStaff.garageId, activeGarage.id))
    const adminAuthClient = createAdminClient()
    staffMembers = await Promise.all(rawStaffRecords.map(async (record) => {
      const { data } = await adminAuthClient.auth.admin.getUserById(record.userId)
      return { id: record.id, name: data.user?.user_metadata?.full_name || "Unknown", email: data.user?.email || "", role: record.role, status: record.status }
    }))

    fleetVehicles = await db
      .select({ id: vehicles.id, regNumber: vehicles.registrationNumber, make: vehicleMakes.name, model: vehicleModels.name })
      .from(vehicleEvents).innerJoin(vehicles, eq(vehicleEvents.vehicleId, vehicles.id)).innerJoin(vehicleMakes, eq(vehicles.makeId, vehicleMakes.id)).innerJoin(vehicleModels, eq(vehicles.modelId, vehicleModels.id))
      .where(eq(vehicleEvents.garageId, activeGarage.id)).groupBy(vehicles.id, vehicles.registrationNumber, vehicleMakes.name, vehicleModels.name)
  }

  // --- STAFF WORKBENCH PIPELINE ---
  let staffRecentEvents: RecentEvent[] = []
  if (activeStaffRecord && activeStaffRecord.staffInfo.status === 'active') {
    // Staff only need to see the recent work queue for their assigned garage
    staffRecentEvents = await db
      .select({ id: vehicleEvents.id, eventType: vehicleEvents.eventType, date: vehicleEvents.dateOfEvent, regNumber: vehicles.registrationNumber, verificationTier: vehicleEvents.verificationTier })
      .from(vehicleEvents).innerJoin(vehicles, eq(vehicleEvents.vehicleId, vehicles.id))
      .where(eq(vehicleEvents.garageId, activeStaffRecord.workspace.id)).orderBy(desc(vehicleEvents.dateOfEvent)).limit(10)
  }

  // --- DRIVER DATA PIPELINE ---
  let driverVehicles: DriverVehicle[] = []
  if (activeDriver) {
    driverVehicles = await db
      .select({ id: vehicles.id, regNumber: vehicles.registrationNumber, year: vehicles.yearOfManufacture, mileage: vehicles.latestMileageKm, make: vehicleMakes.name, model: vehicleModels.name, fuel: vehicles.fuelType })
      .from(vehicleOwnership).innerJoin(vehicles, eq(vehicleOwnership.vehicleId, vehicles.id)).innerJoin(vehicleMakes, eq(vehicles.makeId, vehicleMakes.id)).innerJoin(vehicleModels, eq(vehicles.modelId, vehicleModels.id))
      .where(and(eq(vehicleOwnership.userId, user.id), eq(vehicleOwnership.status, "active")))
  }

  const firstName = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || "User"

  return (
    <>
      <WelcomeModal name={firstName} avatarUrl={user.user_metadata?.avatar_url || ""} />
      
      <div className="mx-auto max-w-6xl w-full">
        {activeGarage && (
          <GarageDashboard garage={activeGarage} metrics={metrics} recentEvents={recentGarageEvents} staffMembers={staffMembers} fleetVehicles={fleetVehicles} />
        )}
        
        {/* 3. RENDER THE SECURE STAFF DASHBOARD */}
        {!activeGarage && activeStaffRecord && activeStaffRecord.staffInfo.status === 'active' && (
          <StaffDashboard staffRecord={activeStaffRecord} recentEvents={staffRecentEvents} userName={firstName} />
        )}
        
        {activeDriver && (
          <DriverDashboard profile={activeDriver} vehicles={driverVehicles} />
        )}
      </div>
    </>
  )
}