'use server'

import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'
import { garages, driverProfiles, garageStaff } from '@auto-os/db/src/schema/tenants.schema'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'

export async function getStaffInviteContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const staffRecord = await db
    .select({
      staffInfo: garageStaff,
      workspace: garages
    })
    .from(garageStaff)
    .innerJoin(garages, eq(garageStaff.garageId, garages.id))
    .where(eq(garageStaff.userId, user.id))
    .limit(1)
    .then(res => res[0])

  return staffRecord || null
}

export async function continueAsStaffOnly(garageId: string) {
  const cookieStore = await cookies()
  cookieStore.set('autoos_active_workspace', `staff_${garageId}`, { path: '/' })
  return { success: true }
}

export async function provisionDriverProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || "Driver"
  
  const existing = await db.select().from(driverProfiles).where(eq(driverProfiles.userId, user.id)).limit(1).then(res => res[0])
  if (!existing) {
    await db.insert(driverProfiles).values({
      userId: user.id,
      fullName: fullName,
      contactEmail: user.email!,
    })
  }

  const cookieStore = await cookies()
  cookieStore.set('autoos_active_workspace', `driver_${user.id}`, { path: '/' })
  return { success: true }
}

export async function provisionGarageTenant(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const garageName = formData.get('garageName') as string
  if (!garageName) throw new Error("Garage Name is required")
  const baseSlug = garageName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()

  const [newGarage] = await db.insert(garages).values({
    ownerId: user.id,
    name: garageName,
    slug: `${baseSlug}-${Math.floor(Math.random() * 10000)}`,
    contactEmail: user.email!,
  }).returning({ id: garages.id })

  const cookieStore = await cookies()
  cookieStore.set('autoos_active_workspace', `owner_${newGarage.id}`, { path: '/' })
  return { success: true }
}

// NEW: The Smart Escape Hatch
export async function cancelAndSignOut() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // 1. SMART DETECTION: Check if they exist in any application tables
    const [isOwner] = await db.select().from(garages).where(eq(garages.ownerId, user.id)).limit(1)
    const [isDriver] = await db.select().from(driverProfiles).where(eq(driverProfiles.userId, user.id)).limit(1)
    const [isStaff] = await db.select().from(garageStaff).where(eq(garageStaff.userId, user.id)).limit(1)

    const hasApplicationData = isOwner || isDriver || isStaff

    if (!hasApplicationData) {
      // TRUE GHOST: Obliterate the identity entirely.
      const adminAuthClient = createAdminClient()
      await adminAuthClient.auth.admin.deleteUser(user.id)
    } else {
      // STAFF MEMBER: Preserve the account, but revoke the Google identity
      const googleIdentity = user.identities?.find(id => id.provider === 'google');
      if (googleIdentity) {
        await supabase.auth.unlinkIdentity(googleIdentity);
      }
    }
    // If they DO have application data (like a staff record), we do nothing here. 
    // They are safely preserved, keeping their new Google SSO capability intact.
  }
  
  // 2. Destroy the local session
  await supabase.auth.signOut()
  
  // 3. Wipe the workspace routing cookie
  const cookieStore = await cookies()
  cookieStore.delete('autoos_active_workspace')
  
  // 4. Return to login cleanly
  redirect('/login')
}