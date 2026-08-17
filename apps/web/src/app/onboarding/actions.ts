'use server'

import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'
import { garages, driverProfiles } from '@auto-os/db/src/schema/tenants.schema'

export async function provisionGarageTenant(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const garageName = formData.get('garageName') as string
  if (!garageName) throw new Error("Garage Name is required")

  const baseSlug = garageName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()

  await db.insert(garages).values({
    ownerId: user.id,
    name: garageName,
    slug: `${baseSlug}-${Math.floor(Math.random() * 10000)}`,
    contactEmail: user.email!,
  })

  return { success: true }
}

export async function provisionDriverProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || "Driver"

  await db.insert(driverProfiles).values({
    userId: user.id,
    fullName: fullName,
    contactEmail: user.email!,
  })

  return { success: true }
}