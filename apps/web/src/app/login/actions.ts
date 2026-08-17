'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

// ... (keep login and signup functions exactly as they are) ...
export type AuthResponse = { success: boolean; error?: string; }

export async function login(prevState: AuthResponse | null, formData: FormData): Promise<AuthResponse> {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  if (!email || !password) return { success: false, error: "Email and password are required." }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function signup(prevState: AuthResponse | null, formData: FormData): Promise<AuthResponse> {
  const supabase = await createClient()
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  if (!fullName || !email || !password) return { success: false, error: "Name, email, and password are required." }
  if (password.length < 8) return { success: false, error: "Password must be at least 8 characters long." }
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
  if (authError) return { success: false, error: authError.message }
  if (!authData.user) return { success: false, error: "Authentication failed to return a valid user session." }
  return { success: true }
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  
  // DYNAMIC HOST RESOLUTION: Reads reverse-proxy headers (ngrok) before falling back to local host
  const headersList = await headers()
  const forwardedHost = headersList.get('x-forwarded-host')
  const forwardedProto = headersList.get('x-forwarded-proto')

  const host = forwardedHost || headersList.get('host') || 'localhost:3000'
  const protocol = forwardedProto || (host.includes('localhost') || host.includes('192.168.') ? 'http' : 'https')
  const resolvedOrigin = `${protocol}://${host}`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${resolvedOrigin}/auth/callback`,
    },
  })

  if (error) {
    console.error("OAuth Initialization Error:", error.message)
    redirect('/login?error=Google authentication failed')
  }

  if (data.url) {
    redirect(data.url)
  }
}