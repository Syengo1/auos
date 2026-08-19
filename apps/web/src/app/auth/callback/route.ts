import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'
import { garages, driverProfiles, garageStaff } from '@auto-os/db/src/schema/tenants.schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers' 

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')

  const headersList = await headers()
  const forwardedHost = headersList.get('x-forwarded-host')
  const forwardedProto = headersList.get('x-forwarded-proto')
  const host = forwardedHost || requestUrl.host
  const protocol = forwardedProto || requestUrl.protocol.replace(':', '')
  const origin = `${protocol}://${host}`

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null;
      if (safeNext === '/update-password') {
        return NextResponse.redirect(`${origin}${safeNext}`)
      }
      
      const existingGarage = await db.select().from(garages).where(eq(garages.ownerId, user.id)).limit(1)
      const existingDriver = await db.select().from(driverProfiles).where(eq(driverProfiles.userId, user.id)).limit(1)
      const existingStaff = await db.select().from(garageStaff).where(eq(garageStaff.userId, user.id)).limit(1)
      
      // CASE 1: Brand new user with no records -> Standard Onboarding
      if (existingGarage.length === 0 && existingDriver.length === 0 && existingStaff.length === 0) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }
      
      // CASE 2: Staff member who hasn't chosen to create a personal driver profile yet
      if (existingStaff.length > 0 && existingDriver.length === 0 && existingGarage.length === 0) {
        return NextResponse.redirect(`${origin}/onboarding?detected=staff`)
      }
      
      // CASE 3: Already has driver profile or multiple linked profiles -> Dashboard
      return NextResponse.redirect(`${origin}/dashboard?welcome=back`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Authentication failed`)
}