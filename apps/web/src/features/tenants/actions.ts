'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { db } from '@/lib/db'
import { garages, garageStaff } from '@auto-os/db/src/schema/tenants.schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type StaffProvisionResponse = {
  success: boolean;
  error?: string;
}

export async function provisionStaffAccount(prevState: StaffProvisionResponse | null, formData: FormData): Promise<StaffProvisionResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  // 1. VERIFY GARAGE OWNER CLEARANCE
  const activeGarage = await db.select().from(garages).where(eq(garages.ownerId, user.id)).limit(1).then(res => res[0])
  if (!activeGarage) {
    return { success: false, error: "Access Denied. Only Garage Owners can provision staff accounts." }
  }

  // 2. EXTRACT DATA
  const fullName = (formData.get('fullName') as string).trim()
  const email = (formData.get('email') as string).toLowerCase().trim()
  const password = formData.get('password') as string
  const role = formData.get('role') as "manager" | "mechanic" | "intern"

  if (password.length < 8) {
    return { success: false, error: "Security Policy: Staff passwords must be at least 8 characters long." }
  }

  try {
    // 3. SECURELY CREATE THE AUTHENTICATION IDENTITY (Bypasses active session)
    const adminAuthClient = createAdminClient()
    const { data: newAuthUser, error: authError } = await adminAuthClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm so they can log in instantly
      user_metadata: { full_name: fullName }
    })

    if (authError) {
      if (authError.message.includes("already exists")) {
        return { success: false, error: "An AutoOS account already exists with this email. Unified Identity linking will be supported in a future update." }
      }
      return { success: false, error: authError.message }
    }

    if (!newAuthUser.user) {
      return { success: false, error: "Failed to generate a secure user identity." }
    }

    // 4. LINK THE NEW IDENTITY TO THE GARAGE (RBAC Mapping)
    await db.insert(garageStaff).values({
      garageId: activeGarage.id,
      userId: newAuthUser.user.id,
      role: role,
      status: "active",
    })

    // 5. TRIGGER REAL-TIME UI REFRESH
    revalidatePath('/dashboard')
    
    return { success: true }

  } catch (err) {
    console.error("Staff Provisioning Error:", err)
    return { success: false, error: "A critical database error occurred while provisioning the staff record." }
  }
}