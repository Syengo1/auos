import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { garages, driverProfiles, garageStaff } from "@auto-os/db/src/schema/tenants.schema"
import { eq } from "drizzle-orm"
import { DashboardShell } from "@/components/dashboard-shell"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 1. VERIFY AUTHENTICATION
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // 2. FETCH ALL POSSIBLE IDENTITIES
  const activeGarageOwner = await db.select().from(garages).where(eq(garages.ownerId, user.id)).limit(1).then(res => res[0])
  
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

  if (!activeGarageOwner && !activeStaffRecord && !activeDriver) {
    redirect("/onboarding")
  }

  // 3. COMPILE AVAILABLE WORKSPACES
  // We build an array of all accounts the user owns, ordered by priority clearance.
  const availableWorkspaces = []
  
  if (activeGarageOwner) {
    availableWorkspaces.push({
      id: `owner_${activeGarageOwner.id}`,
      role: "garage_owner" as const,
      name: activeGarageOwner.name,
      clearance: "owner"
    })
  }
  
  if (activeStaffRecord && activeStaffRecord.staffInfo.status === 'active') {
    availableWorkspaces.push({
      id: `staff_${activeStaffRecord.workspace.id}`,
      role: "garage_staff" as const,
      name: activeStaffRecord.workspace.name,
      clearance: activeStaffRecord.staffInfo.role
    })
  }
  
  if (activeDriver) {
    availableWorkspaces.push({
      id: `driver_${activeDriver.id}`,
      role: "driver" as const,
      name: "Personal Passport",
      clearance: null
    })
  }

  // 4. SMART USER-BOUND COOKIE READER
  const cookieStore = await cookies()
  const userCookieKey = `autoos_workspace_${user.id}`
  const savedWorkspaceId = cookieStore.get(userCookieKey)?.value

  // Find the requested workspace, or default to the highest clearance one (index 0)
  let activeWorkspace = availableWorkspaces.find(w => w.id === savedWorkspaceId)
  if (!activeWorkspace) {
    activeWorkspace = availableWorkspaces[0]
  }

  // 5. PACKAGE USER DATA FOR THE SHELL
  const userData = {
    name: user.user_metadata?.full_name || user.email || "User",
    email: user.email || "",
    avatarUrl: user.user_metadata?.avatar_url || "",
    workspaceName: activeWorkspace.name,
    staffClearance: activeWorkspace.clearance,
    availableWorkspaces,            
    activeWorkspaceId: activeWorkspace.id 
  }

  // 6. SECURE SERVER ACTIONS
  async function signOutAction() {
    "use server"
    const supabaseAuth = await createClient()
    await supabaseAuth.auth.signOut()
    
    // CRITICAL FIX: We NO LONGER delete the cookie here. 
    // It remains in the browser safely bound to their specific user.id.
    
    revalidatePath("/", "layout")
    redirect("/login")
  }

  // NEW: Secure User-Bound Workspace Switcher Action
  async function switchWorkspaceAction(workspaceId: string) {
    "use server"
    const supabaseAuth = await createClient()
    const { data: { user: activeUser } } = await supabaseAuth.auth.getUser()
    
    if (activeUser) {
      const cookieStore = await cookies()
      // Store the preference securely bound to the user for 30 days
      cookieStore.set(`autoos_workspace_${activeUser.id}`, workspaceId, { 
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    }
    revalidatePath("/dashboard", "layout")
  }

  // 7. RENDER THE RESPONSIVE SHELL
  return (
    <DashboardShell 
      role={activeWorkspace.role} 
      user={userData} 
      signOutAction={signOutAction}
      switchWorkspaceAction={switchWorkspaceAction}
    >
      {children}
    </DashboardShell>
  )
}