import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { garages, garageStaff } from "@auto-os/db/src/schema/tenants.schema"
import { vehicles, vehicleMakes, vehicleModels, vehicleEvents } from "@auto-os/db/src/schema/vehicles.schema"
import { eq } from "drizzle-orm"
import { getActiveGarageJobs } from "@/features/job-cards/queries"
import { JobsViewManager } from "@/features/job-cards/components/jobs-view-manager"

// NEW IMPORTS FOR THE HEADER BUTTON
import { CreateJobDialog } from "@/features/job-cards/components/create-job-dialog"
import { buttonVariants } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default async function ServiceBaysPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const activeGarageOwner = await db.select().from(garages).where(eq(garages.ownerId, user.id)).limit(1).then(res => res[0])
  const activeStaff = await db.select().from(garageStaff).where(eq(garageStaff.userId, user.id)).limit(1).then(res => res[0])
  
  const activeGarageId = activeGarageOwner?.id || activeStaff?.garageId

  if (!activeGarageId) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        You do not have clearance to view active service bays.
      </div>
    )
  }

  const activeJobs = await getActiveGarageJobs(activeGarageId)
  
  const fleetVehicles = await db
    .select({ id: vehicles.id, regNumber: vehicles.registrationNumber, make: vehicleMakes.name, model: vehicleModels.name })
    .from(vehicleEvents).innerJoin(vehicles, eq(vehicleEvents.vehicleId, vehicles.id)).innerJoin(vehicleMakes, eq(vehicles.makeId, vehicleMakes.id)).innerJoin(vehicleModels, eq(vehicles.modelId, vehicleModels.id))
    .where(eq(vehicleEvents.garageId, activeGarageId)).groupBy(vehicles.id, vehicles.registrationNumber, vehicleMakes.name, vehicleModels.name)

  return (
    // FIX 1: flex-1 flex-col min-h-0 locks this page into the exact bounds of the main container
    <div className="flex-1 flex flex-col min-h-0 animate-in fade-in zoom-in-95 duration-500">
      
      {/* FIX 2: A perfectly aligned flex header that groups the title and the primary action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Bays</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage active repair orders, diagnostics, and shop floor execution.
          </p>
        </div>

        {/* PRIMARY ACTION MOVED HERE */}
        <CreateJobDialog garageId={activeGarageId} fleetVehicles={fleetVehicles}>
          <div className={cn(buttonVariants({ size: "default" }), "cursor-pointer shadow-sm shrink-0 w-full sm:w-auto")}>
            <PlusCircle className="mr-2 size-4" /> Check-in Vehicle
          </div>
        </CreateJobDialog>
      </div>

      {/* FIX 3: Propagating the strict clipping boundary down to the tabs */}
      <div className="flex-1 min-h-0 flex flex-col">
        <JobsViewManager 
          initialJobs={activeJobs} 
          garageId={activeGarageId} 
          fleetVehicles={fleetVehicles} 
        />
      </div>
    </div>
  )
}