'use server'

import { createClient } from '@/utils/supabase/server'

export type UpdatePasswordResponse = {
  success: boolean;
  error?: string;
}

export async function updatePassword(prevState: UpdatePasswordResponse | null, formData: FormData): Promise<UpdatePasswordResponse> {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." }
  }

  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long." }
  }

  // Because the user arrived via the secure email link, they have an active session.
  // updateUser() securely overwrites their old password.
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}