import 'server-only' // <--- THE SECURITY BOUNCER
import { createClient } from '@supabase/supabase-js'

// SECURITY WARNING: This client bypasses all Row Level Security (RLS). 
// The 'server-only' import guarantees this file will crash the build if 
// accidentally imported into a browser component.

export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}