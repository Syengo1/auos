import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { garages, driverProfiles, garageStaff } from "@auto-os/db/src/schema/tenants.schema"
import { eq } from "drizzle-orm"
import { DashboardShell } from "@/components/dashboard-shell"
import { revalidatePath } from "next/cache"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 1. VERIFY AUTHENTICATION
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // 2. FETCH ALL POSSIBLE IDENTITIES
  const activeGarageOwner = await db.select().from(garages).where(eq(garages.ownerId, user.id)).limit(1).then(res => res[0])
  
  // NEW: Check if they are invited staff, and pull the garage data they are linked to
  const activeStaffRecord = await db
    .select({
      staffInfo: garageStaff,
      workspace: garages
    })
    .from(garageStaff)
    .innerJoin(garages, eq(garageStaff.garageId, garages.id))
    .where(eq(garageStaff.userId, user.id))
    .limit(1)
    .then(res => res[0])

  const activeDriver = await db.select().from(driverProfiles).where(eq(driverProfiles.userId, user.id)).limit(1).then(res => res[0])

  // 3. RESOLVE WORKSPACE CONTEXT
  if (!activeGarageOwner && !activeStaffRecord && !activeDriver) {
    redirect("/onboarding")
  }

  // Determine effective role and workspace name
  let role: "garage_owner" | "garage_staff" | "driver" = "driver"
  let workspaceName = activeDriver?.fullName || "Personal Passport"
  let staffClearance = null

  if (activeGarageOwner) {
    role = "garage_owner"
    workspaceName = activeGarageOwner.name
  } else if (activeStaffRecord && activeStaffRecord.staffInfo.status === 'active') {
    role = "garage_staff"
    workspaceName = activeStaffRecord.workspace.name
    staffClearance = activeStaffRecord.staffInfo.role // e.g., 'manager', 'mechanic', 'intern'
  }

  const userData = {
    name: user.user_metadata?.full_name || user.email || "User",
    email: user.email || "",
    avatarUrl: user.user_metadata?.avatar_url || "",
    workspaceName,
    staffClearance
  }

  // 4. SECURE SERVER ACTION FOR LOGOUT
  async function signOutAction() {
    "use server"
    const supabaseAuth = await createClient()
    await supabaseAuth.auth.signOut()
    revalidatePath("/", "layout")
    redirect("/login")
  }

  // 5. RENDER THE RESPONSIVE SHELL
  return (
    <DashboardShell role={role} user={userData} signOutAction={signOutAction}>
      {children}
    </DashboardShell>
  )
}