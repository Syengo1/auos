"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CarFront, Home, Settings, Users, Wrench, FileText, LogOut, ShieldCheck, BadgeCheck, ChevronsUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"

const NAV_CONFIG = {
  garage_owner: [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Service Bays", href: "/dashboard/jobs", icon: Wrench },
    { name: "Team & Clients", href: "/dashboard/clients", icon: Users },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
  garage_staff: [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Service Bays", href: "/dashboard/jobs", icon: Wrench },
  ],
  driver: [
    { name: "Passport", href: "/dashboard", icon: Home },
    { name: "My Vehicles", href: "/dashboard/vehicles", icon: CarFront },
    { name: "Records", href: "/dashboard/records", icon: FileText },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
}

export type WorkspaceOption = {
  id: string;
  role: "garage_owner" | "garage_staff" | "driver";
  name: string;
  clearance: string | null;
}

type DashboardShellProps = {
  children: React.ReactNode;
  role: "garage_owner" | "garage_staff" | "driver";
  user: {
    name: string;
    email: string;
    avatarUrl: string;
    workspaceName: string;
    staffClearance: string | null;
    availableWorkspaces?: WorkspaceOption[];
    activeWorkspaceId?: string;
  };
  signOutAction: () => Promise<void>;
  switchWorkspaceAction?: (workspaceId: string) => Promise<void>;
}

export function DashboardShell({ children, role, user, signOutAction, switchWorkspaceAction }: DashboardShellProps) {
  const pathname = usePathname()
  const navItems = NAV_CONFIG[role]
  const firstName = user.name.split(' ')[0]
  const [switcherOpen, setSwitcherOpen] = useState(false)

  const workspaces = user.availableWorkspaces || []
  const hasMultiple = workspaces.length > 1

  return (
    <div className="flex min-h-svh w-full bg-muted/10">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background/95 backdrop-blur sticky top-0 h-svh">
        
        {/* Workspace Brand & Switcher */}
        <div className="flex flex-col border-b p-4 relative">
          <div className="flex items-center gap-2 font-semibold text-lg mb-1">
            <ShieldCheck className="size-5 text-primary" /> AutoOS
          </div>

          <button
            onClick={() => hasMultiple && setSwitcherOpen(!switcherOpen)}
            className={cn(
              "flex items-center justify-between mt-2 px-2.5 py-2 bg-muted/70 hover:bg-muted rounded-xl border text-left transition-all",
              hasMultiple ? "cursor-pointer" : "cursor-default"
            )}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className={cn("size-2 rounded-full shrink-0", role === "driver" ? "bg-blue-500" : "bg-green-500 animate-pulse")} />
              <span className="text-xs font-semibold truncate">{user.workspaceName}</span>
            </div>
            {hasMultiple && <ChevronsUpDown className="size-3.5 text-muted-foreground shrink-0" />}
          </button>

          {/* Switcher Dropdown Menu */}
          {switcherOpen && hasMultiple && (
            <div className="absolute top-full left-4 right-4 mt-1 bg-popover border rounded-xl shadow-lg p-1.5 z-50 space-y-1 animate-in fade-in zoom-in-95">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 block">
                Switch Workspace
              </span>
              {workspaces.map((ws) => {
                const isActive = ws.id === user.activeWorkspaceId
                return (
                  <button
                    key={ws.id}
                    onClick={async () => {
                      setSwitcherOpen(false)
                      if (switchWorkspaceAction && !isActive) {
                        await switchWorkspaceAction(ws.id)
                      }
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition-colors text-left",
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
                    )}
                  >
                    <div className="flex flex-col truncate">
                      <span className="font-semibold truncate">{ws.name}</span>
                      <span className={cn("text-[10px] capitalize opacity-80", isActive ? "text-primary-foreground" : "text-muted-foreground")}>
                        {ws.role.replace('_', ' ')} {ws.clearance ? `• ${ws.clearance}` : ''}
                      </span>
                    </div>
                    {isActive && <Check className="size-3.5 shrink-0 ml-1" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-primary/10 hover:text-primary",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("size-5", isActive && "fill-primary/20")} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User Identity & Logout */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3 mb-4 px-2">
            <Avatar className="size-9 border shadow-sm">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="bg-primary/10 text-primary">{firstName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium truncate">{user.name}</p>
                {user.staffClearance && (
                  <span title={`Clearance: ${user.staffClearance}`} className="flex shrink-0">
                    <BadgeCheck className="size-3.5 text-blue-500" />
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate uppercase tracking-wider mt-0.5">
                {role.replace('_', ' ')}
              </p>
            </div>
          </div>
          <button 
            onClick={() => signOutAction()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MOBILE LAYOUT */}
      <div className="flex flex-1 flex-col">
        <header className="md:hidden flex h-14 items-center justify-between border-b bg-background/95 px-4 sticky top-0 z-40 backdrop-blur">
          <span className="font-semibold flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary"/> AutoOS
          </span>
          <div className="flex items-center gap-2">
            {hasMultiple && (
              <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full font-medium truncate max-w-[120px]">
                {user.workspaceName}
              </span>
            )}
            <button onClick={() => signOutAction()} className="text-muted-foreground p-2 -mr-2">
              <LogOut className="size-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          {children}
        </main>

        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 flex h-16 items-center justify-around border-t bg-background/85 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center w-full h-full gap-1">
                <div className={cn("flex flex-col items-center transition-all duration-300", isActive ? "-translate-y-1 text-primary scale-110" : "text-muted-foreground")}>
                  <item.icon className={cn("size-5 mb-1", isActive && "fill-primary/20")} />
                  <span className={cn("text-[10px] font-medium leading-none", isActive ? "opacity-100" : "opacity-70")}>
                    {item.name}
                  </span>
                </div>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}