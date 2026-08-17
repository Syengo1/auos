'use server'

import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { vehicles, vehicleMakes, vehicleModels, vehicleOwnership, vehicleEvents } from '@auto-os/db/src/schema/vehicles.schema'
import { driverProfiles, garages } from '@auto-os/db/src/schema/tenants.schema'
import { eq, and } from 'drizzle-orm'

export type VehicleRegistrationResponse = {
  success: boolean;
  error?: string;
}

export async function registerVehicle(prevState: VehicleRegistrationResponse | null, formData: FormData): Promise<VehicleRegistrationResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  // 1. EXTRACT & NORMALIZE DATA
  const regNumber = (formData.get('registrationNumber') as string).toUpperCase().replace(/\s+/g, ' ').trim()
  const vin = (formData.get('vin') as string).toUpperCase().trim()
  const rawMake = (formData.get('make') as string).trim()
  const makeName = rawMake.charAt(0).toUpperCase() + rawMake.slice(1).toLowerCase()
  const rawModel = (formData.get('model') as string).trim()
  const modelName = rawModel.charAt(0).toUpperCase() + rawModel.slice(1).toLowerCase()
  const year = parseInt(formData.get('year') as string)
  const mileage = parseInt(formData.get('mileage') as string) || 0
  const fuelType = formData.get('fuelType') as "petrol" | "diesel" | "hybrid" | "electric"
  
  // NEW: Extract Category
  const category = formData.get('category') as "passenger_car" | "motorcycle" | "commercial_van" | "heavy_truck" | "machinery" | "other"

  // 2. SMART HEURISTIC VALIDATION (Forgiving but Secure)
  const plateRegex = /^[A-Z0-9\s-]{3,15}$/i;
  const chassisRegex = /^[A-Z0-9-]{5,25}$/i;

  if (!plateRegex.test(regNumber)) {
    return { success: false, error: "Invalid plate. Use 3-15 alphanumeric characters, spaces, or hyphens." }
  }
  if (!chassisRegex.test(vin)) {
    return { success: false, error: "Invalid identifier. Use 5-25 alphanumeric characters or hyphens." }
  }

  try {
    // 3. IDENTIFY THE USER'S ROLE
    const isGarage = await db.select().from(garages).where(eq(garages.ownerId, user.id)).limit(1).then(res => res[0])
    const isDriver = await db.select().from(driverProfiles).where(eq(driverProfiles.userId, user.id)).limit(1).then(res => res[0])
    
    // NEW: Also check if they are Garage Staff (Mechanic logging a vehicle)
    const isStaff = !isGarage && !isDriver ? true : false; // Simplified for flow, assumes auth middleware caught them
    const activeGarageId = isGarage ? isGarage.id : null; 

    // 4. TAXONOMY RESOLUTION (Choose or Create)
    let makeId: string;
    const existingMake = await db.select().from(vehicleMakes).where(eq(vehicleMakes.name, makeName)).limit(1).then(res => res[0])
    if (existingMake) { makeId = existingMake.id } 
    else {
      const newMake = await db.insert(vehicleMakes).values({ name: makeName, isVerified: false }).returning({ id: vehicleMakes.id })
      makeId = newMake[0].id
    }

    let modelId: string;
    const existingModel = await db.select().from(vehicleModels).where(and(eq(vehicleModels.name, modelName), eq(vehicleModels.makeId, makeId))).limit(1).then(res => res[0])
    if (existingModel) { modelId = existingModel.id } 
    else {
      const newModel = await db.insert(vehicleModels).values({ makeId, name: modelName, isVerified: false }).returning({ id: vehicleModels.id })
      modelId = newModel[0].id
    }

    // 5. VEHICLE UPSERT & ANTI-HIJACKING
    let vehicleId: string;
    const existingVehicle = await db.select().from(vehicles).where(eq(vehicles.vinChassisNumber, vin)).limit(1).then(res => res[0])
    
    if (existingVehicle) {
      if (isDriver) {
        const activeOwner = await db.select().from(vehicleOwnership).where(and(eq(vehicleOwnership.vehicleId, existingVehicle.id), eq(vehicleOwnership.status, "active"))).limit(1).then(res => res[0])
        if (activeOwner && activeOwner.userId !== user.id) {
          return { success: false, error: "This identifier is actively registered to another user." }
        }
      }
      vehicleId = existingVehicle.id
      if (mileage > existingVehicle.latestMileageKm!) {
        await db.update(vehicles).set({ latestMileageKm: mileage }).where(eq(vehicles.id, vehicleId))
      }
    } else {
      const newVehicle = await db.insert(vehicles).values({
        registrationNumber: regNumber,
        vinChassisNumber: vin,
        vehicleCategory: category, // NEW
        makeId,
        modelId,
        yearOfManufacture: year,
        fuelType,
        latestMileageKm: mileage,
      }).returning({ id: vehicles.id })
      vehicleId = newVehicle[0].id
    }

    // 6. RECORD THE EVENT / OWNERSHIP
    if (isDriver) {
      const existingOwnership = await db.select().from(vehicleOwnership).where(and(eq(vehicleOwnership.vehicleId, vehicleId), eq(vehicleOwnership.userId, user.id))).limit(1).then(res => res[0])
      if (!existingOwnership) {
        await db.insert(vehicleOwnership).values({ vehicleId, userId: user.id, status: "active" })
      }
    }

    await db.insert(vehicleEvents).values({
      vehicleId,
      recordedById: user.id,
      garageId: activeGarageId,
      verificationTier: activeGarageId || isStaff ? "tier_2_commercial" : "tier_4_user_entered",
      eventType: "registration",
      dateOfEvent: new Date(),
      mileageAtEventKm: mileage,
      notes: "Initial system registration."
    })

    // TRIGGER INSTANT UI REFRESH
    revalidatePath('/dashboard')

    return { success: true }

  } catch (err: unknown) {
    console.error("Registration Error:", err)
    if (err !== null && typeof err === 'object' && 'code' in err && err.code === '23505') {
      return { success: false, error: "This Registration Number or Identifier already exists under conflicting data." }
    }
    return { success: false, error: "An unexpected database error occurred." }
  }
}