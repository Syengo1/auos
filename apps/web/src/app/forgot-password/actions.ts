'use server'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export type RecoveryResponse = {
  success: boolean;
  error?: string;
}

export async function resetPassword(prevState: RecoveryResponse | null, formData: FormData): Promise<RecoveryResponse> {
  const supabase = await createClient()
  const email = formData.get('email') as string

  if (!email) {
    return { success: false, error: "Email address is required." }
  }

  // DYNAMIC HOST RESOLUTION: Automatically adapts to PC, Mobile IP, or Ngrok Tunnel
  const headersList = await headers()
  const forwardedHost = headersList.get('x-forwarded-host')
  const forwardedProto = headersList.get('x-forwarded-proto')

  const host = forwardedHost || headersList.get('host') || 'localhost:3000'
  const protocol = forwardedProto || (host.includes('localhost') || host.includes('192.168.') ? 'http' : 'https')
  const resolvedOrigin = `${protocol}://${host}`

  // Safely trigger Supabase's built-in email recovery pipeline with the dynamic origin
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${resolvedOrigin}/auth/callback?next=/update-password`,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}