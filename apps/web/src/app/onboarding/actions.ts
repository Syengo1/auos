'use server'

import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'
import { garages, driverProfiles, garageStaff } from '@auto-os/db/src/schema/tenants.schema'
import { eq, sql } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'

// Shared cookie security options for military-grade persistence
const cookieOptions = {
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const
}

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
  // FIX: Fetch the user session so we can bind the cookie securely to their ID
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const cookieStore = await cookies()
    cookieStore.set(`autoos_workspace_${user.id}`, `staff_${garageId}`, cookieOptions)
  }
  return { success: true }
}

export async function provisionDriverProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || "Driver"
  
  // 1. SMART CHECK: Look for an existing profile by User ID *OR* Email
  const [existingProfile] = await db
    .select()
    .from(driverProfiles)
    .where(
       sql`${driverProfiles.userId} = ${user.id} OR ${driverProfiles.contactEmail} = ${user.email}`
    )
    .limit(1)

  if (!existingProfile) {
    // 2. TRUE NEW USER: Insert fresh record
    await db.insert(driverProfiles).values({
      userId: user.id,
      fullName: fullName,
      contactEmail: user.email!,
    })
  } else if (existingProfile.userId !== user.id) {
    // 3. ORPHAN RECLAMATION
    await db.update(driverProfiles)
      .set({ userId: user.id })
      .where(eq(driverProfiles.id, existingProfile.id))
  }

  // FIX: Secure User-Bound Cookie
  const cookieStore = await cookies()
  cookieStore.set(`autoos_workspace_${user.id}`, `driver_${user.id}`, cookieOptions)
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

  // FIX: Secure User-Bound Cookie
  const cookieStore = await cookies()
  cookieStore.set(`autoos_workspace_${user.id}`, `owner_${newGarage.id}`, cookieOptions)
  return { success: true }
}

export async function cancelAndSignOut() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
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
  }
  
  // 2. Destroy the local session
  await supabase.auth.signOut()
  
  // 3. FIX: Wipe BOTH the new user-bound cookie and force-delete the old ghost cookie
  const cookieStore = await cookies()
  if (user) {
    cookieStore.delete(`autoos_workspace_${user.id}`)
  }
  // Obliterate the ghost cookie just in case it is still stuck in the browser
  cookieStore.delete('autoos_active_workspace') 
  
  // 4. Return to login cleanly
  redirect('/login')
}