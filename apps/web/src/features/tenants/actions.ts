'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { db } from '@/lib/db'
import { garages, garageStaff } from '@auto-os/db/src/schema/tenants.schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers' // <-- NEW: Import headers

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

  const fullName = (formData.get('fullName') as string).trim()
  const email = (formData.get('email') as string).toLowerCase().trim()
  const role = formData.get('role') as "manager" | "mechanic" | "intern"

  try {
    const adminAuthClient = createAdminClient()
    
    // 2. DYNAMIC HOST RESOLUTION: Adapts to Localhost, Mobile IP, Ngrok, or Vercel
    const headersList = await headers()
    const forwardedHost = headersList.get('x-forwarded-host')
    const forwardedProto = headersList.get('x-forwarded-proto')
    const host = forwardedHost || headersList.get('host') || 'localhost:3000'
    const protocol = forwardedProto || (host.includes('localhost') || host.includes('192.168.') ? 'http' : 'https')
    const resolvedOrigin = `${protocol}://${host}`

    // 3. SECURE INVITATION DISPATCH
    const { data: inviteData, error: inviteError } = await adminAuthClient.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName },
      redirectTo: `${resolvedOrigin}/auth/callback?next=/update-password` // <-- Forces route to the password setup page
    })

    if (inviteError) {
      if (inviteError.message.includes("already exists") || inviteError.message.includes("already registered")) {
         const { data: existingUser } = await adminAuthClient.auth.admin.listUsers()
         const targetUser = existingUser.users.find(u => u.email === email)
         
         if (targetUser) {
           const existingStaff = await db.select().from(garageStaff)
              .where(and(eq(garageStaff.userId, targetUser.id), eq(garageStaff.garageId, activeGarage.id)))
              .limit(1).then(res => res[0])

           if (existingStaff) {
             return { success: false, error: "This user is already provisioned at this garage." }
           }

           await db.insert(garageStaff).values({
             garageId: activeGarage.id,
             userId: targetUser.id,
             role: role,
             status: "active",
           })
           revalidatePath('/dashboard')
           return { success: true }
         }
      }
      return { success: false, error: inviteError.message }
    }

    if (!inviteData.user) {
      return { success: false, error: "Failed to generate a secure user invitation." }
    }

    // 4. Link the newly invited identity to the garage
    await db.insert(garageStaff).values({
      garageId: activeGarage.id,
      userId: inviteData.user.id,
      role: role,
      status: "active",
    })

    revalidatePath('/dashboard')
    
    return { success: true }

  } catch (err) {
    console.error("Staff Provisioning Error:", err)
    return { success: false, error: "A critical database error occurred while provisioning the staff record." }
  }
}