import { db } from '@/lib/db'
import { jobCards } from '@auto-os/db/src/schema/jobs.schema'
import { vehicles, vehicleMakes, vehicleModels } from '@auto-os/db/src/schema/vehicles.schema'
import { eq, desc } from 'drizzle-orm'

export async function getActiveGarageJobs(garageId: string) {
  // Fetches all jobs that are NOT completed or cancelled
  return await db
    .select({
      id: jobCards.id,
      status: jobCards.status,
      mileageIn: jobCards.mileageIn,
      clientNotes: jobCards.clientNotes,
      createdAt: jobCards.createdAt,
      vehicle: {
        id: vehicles.id,
        regNumber: vehicles.registrationNumber,
        make: vehicleMakes.name,
        model: vehicleModels.name,
      }
    })
    .from(jobCards)
    .innerJoin(vehicles, eq(jobCards.vehicleId, vehicles.id))
    .innerJoin(vehicleMakes, eq(vehicles.makeId, vehicleMakes.id))
    .innerJoin(vehicleModels, eq(vehicles.modelId, vehicleModels.id))
    .where(eq(jobCards.garageId, garageId))
    .orderBy(desc(jobCards.createdAt))
}