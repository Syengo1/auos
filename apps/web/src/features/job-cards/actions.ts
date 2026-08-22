'use server'

import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'
import { jobCards } from '@auto-os/db/src/schema/jobs.schema'
import { garageStaff } from '@auto-os/db/src/schema/tenants.schema'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type JobCardResponse = {
  success: boolean;
  jobId?: string;
  error?: string;
}

// 1. CREATE A NEW JOB CARD (Vehicle Check-in)
export async function createJobCard(formData: FormData): Promise<JobCardResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const vehicleId = formData.get('vehicleId') as string
  const garageId = formData.get('garageId') as string
  const mileageIn = parseInt(formData.get('mileageIn') as string)
  const clientNotes = formData.get('clientNotes') as string

  if (!vehicleId || !garageId || isNaN(mileageIn)) {
    return { success: false, error: "Missing required fields for check-in." }
  }

  try {
    // SECURITY: Ensure the user is actually active staff at this specific garage
    const activeStaff = await db.select().from(garageStaff)
      .where(and(
        eq(garageStaff.userId, user.id), 
        eq(garageStaff.garageId, garageId),
        eq(garageStaff.status, "active")
      ))
      .limit(1).then(res => res[0])

    if (!activeStaff) {
      return { success: false, error: "You do not have clearance to open jobs here." }
    }

    // IRONCLAD CREATION: Lock the job to the diagnostic phase immediately
    const [newJob] = await db.insert(jobCards).values({
      garageId,
      vehicleId,
      serviceAdvisorId: activeStaff.id, // Tied to the specific staff profile, not the global user
      mileageIn,
      clientNotes,
      status: "diagnostic", 
    }).returning({ id: jobCards.id })

    revalidatePath('/dashboard/jobs')
    return { success: true, jobId: newJob.id }

  } catch (error) {
    console.error("Job Creation Error:", error)
    return { success: false, error: "Failed to open job card." }
  }
}