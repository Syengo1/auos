"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { Wrench, FileSpreadsheet, Plus, ClipboardList, ShieldCheck, BadgeCheck, Clock } from "lucide-react"
import { AddVehicleDialog } from "@/features/vehicles/components/add-vehicle-dialog"
import { cn } from "@/lib/utils"

// 1. DEFINE EXACT TYPE FOR RECENT EVENTS
type RecentEvent = {
  id: string;
  eventType: string;
  date: Date;
  regNumber: string;
  verificationTier: string;
}

type StaffDashboardProps = {
  userName: string;
  staffRecord: {
    staffInfo: { role: string; status: string; };
    workspace: { name: string; isVerified: boolean | null; };
  };
  // 2. REPLACE 'any[]' WITH STRICT TYPE
  recentEvents: RecentEvent[];
}

export function StaffDashboard({ userName, staffRecord, recentEvents }: StaffDashboardProps) {
  const { workspace, staffInfo } = staffRecord;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 delay-300 fill-mode-both">
      
      {/* WORKSPACE HERO */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm overflow-hidden relative">
        <div className="absolute -right-10 -top-10 p-6 opacity-[0.03] pointer-events-none">
          <Wrench className="size-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {workspace.isVerified ? (
                <BadgeCheck className="size-5 text-green-500" />
              ) : (
                <ShieldCheck className="size-5 text-primary" />
              )}
              <span className="text-sm font-bold tracking-wider uppercase text-muted-foreground">
                {workspace.name}
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome, {userName}</h2>
            <div className="flex items-center gap-2 mt-3">
               <span className="inline-flex items-center rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-500 uppercase tracking-wider">
                 Clearance: {staffInfo.role}
               </span>
               <span className="text-sm text-muted-foreground">Technician Workbench</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: ACTIVE SHOP QUEUE */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <ClipboardList className="size-5 text-primary" /> Active Garage Ledger
            </h3>
          </div>

          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            {recentEvents.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-48 text-center p-6">
                 <Clock className="size-8 text-muted-foreground/30 mb-3" />
                 <p className="text-sm font-medium text-muted-foreground">The service queue is empty.</p>
               </div>
            ) : (
              <div className="w-full overflow-auto max-h-[500px]">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/10 border-b sticky top-0">
                    <tr>
                      <th className="px-5 py-3 font-medium">Asset Reg</th>
                      <th className="px-5 py-3 font-medium">Event Type</th>
                      <th className="px-5 py-3 font-medium">Date Logged</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3.5 font-bold">
                          <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                            {event.regNumber}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground font-medium capitalize">
                          {event.eventType.replace('_', ' ')}
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {new Intl.DateTimeFormat('en-KE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(event.date))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: EXECUTION TOOLS (Massive Touch Targets) */}
        <div className="space-y-4">
           <h3 className="text-lg font-semibold tracking-tight opacity-0">Tools</h3>
           <div className="rounded-2xl border bg-card p-5 shadow-sm flex flex-col gap-3">
             
             <AddVehicleDialog>
               <div className={cn(buttonVariants({ size: "lg" }), "w-full justify-start h-16 cursor-pointer shadow-sm")}>
                 <Plus className="mr-3 size-6" />
                 <div className="flex flex-col items-start">
                   <span className="font-semibold text-base">Check-in Asset</span>
                   <span className="text-[10px] opacity-70 font-normal">Register new vehicle to shop</span>
                 </div>
               </div>
             </AddVehicleDialog>

             <Button size="lg" variant="outline" className="w-full justify-start h-16 shadow-sm group">
               <Wrench className="mr-3 size-6 text-primary group-hover:scale-110 transition-transform" />
               <div className="flex flex-col items-start">
                  <span className="font-semibold text-base">Log Service Event</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Record maintenance or repair</span>
                </div>
             </Button>

             <Button size="lg" variant="outline" className="w-full justify-start h-16 shadow-sm group">
               <FileSpreadsheet className="mr-3 size-6 text-primary group-hover:scale-110 transition-transform" />
               <div className="flex flex-col items-start">
                  <span className="font-semibold text-base">Create Invoice</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Draft a new billing record</span>
                </div>
             </Button>
           </div>
        </div>

      </div>
    </div>
  )
}