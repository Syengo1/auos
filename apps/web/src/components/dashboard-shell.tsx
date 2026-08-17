"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CarFront, Home, Settings, Users, Wrench, FileText, LogOut, ShieldCheck, BadgeCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// 1. GRANULAR ROLE CONFIGURATION
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
    // Mechanics and interns do not see billing/settings
  ],
  driver: [
    { name: "Passport", href: "/dashboard", icon: Home },
    { name: "My Vehicles", href: "/dashboard/vehicles", icon: CarFront },
    { name: "Records", href: "/dashboard/records", icon: FileText },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
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
  };
  signOutAction: () => Promise<void>;
}

export function DashboardShell({ children, role, user, signOutAction }: DashboardShellProps) {
  const pathname = usePathname()
  const navItems = NAV_CONFIG[role]
  const firstName = user.name.split(' ')[0]

  return (
    <div className="flex min-h-svh w-full bg-muted/10">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 h-svh">
        
        {/* Workspace Indicator */}
        <div className="flex flex-col border-b p-4">
           <div className="flex items-center gap-2 font-semibold text-lg mb-1">
             <ShieldCheck className="size-5 text-primary" /> AutoOS
           </div>
           <div className="flex items-center gap-2 mt-2 px-2 py-1.5 bg-muted rounded-md border">
              <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium truncate">{user.workspaceName}</span>
           </div>
        </div>
        
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

        <div className="border-t p-4">
          <div className="flex items-center gap-3 mb-4 px-2">
            <Avatar className="size-9 border shadow-sm">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="bg-primary/10 text-primary">{firstName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium truncate">{user.name}</p>
                {/* FIX: Wrapped the icon in a native span to safely handle the title attribute */}
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

      {/* --- MOBILE LAYOUT --- */}
      <div className="flex flex-1 flex-col">
        <header className="md:hidden flex h-14 items-center justify-between border-b bg-background/95 px-4 sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <span className="font-semibold flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary"/> AutoOS
          </span>
          <button onClick={() => signOutAction()} className="text-muted-foreground p-2 -mr-2">
            <LogOut className="size-5" />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          {children}
        </main>

        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 flex h-16 items-center justify-around border-t bg-background/85 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center w-full h-full gap-1">
                <div className={cn("flex flex-col items-center transition-all duration-300", isActive ? "-translate-y-1 text-primary scale-110" : "text-muted-foreground hover:text-foreground")}>
                  <item.icon className={cn("size-5 mb-1", isActive && "fill-primary/20")} />
                  <span className={cn("text-[10px] font-medium leading-none transition-opacity duration-300", isActive ? "opacity-100" : "opacity-70")}>
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