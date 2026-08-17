import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'
import { garages, driverProfiles } from '@auto-os/db/src/schema/tenants.schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers' 

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')

  // DYNAMIC HOST RESOLUTION FOR REVERSE PROXIES (NGROK)
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
      // SECURITY UPGRADE: Open Redirect Protection
      // Ensures the 'next' parameter is strictly a local relative path, preventing malicious external redirects.
      const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null;

      if (safeNext === '/update-password') {
        return NextResponse.redirect(`${origin}${safeNext}`)
      }
      
      const existingGarage = await db.select().from(garages).where(eq(garages.ownerId, user.id)).limit(1)
      const existingDriver = await db.select().from(driverProfiles).where(eq(driverProfiles.userId, user.id)).limit(1)
      
      if (existingGarage.length === 0 && existingDriver.length === 0) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }
      
      return NextResponse.redirect(`${origin}/dashboard?welcome=back`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Authentication failed`)
}