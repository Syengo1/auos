"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ChevronRight, Users, CarFront, Wrench, ShieldCheck, MoreHorizontal, UserCheck, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ElementType } from "react"

// Data Types
type RecentEvent = { id: string; eventType: string; date: Date; regNumber: string; verificationTier: string; }
export type StaffMember = { id: string; name: string; email: string; role: string; status: string; }
export type FleetVehicle = { id: string; regNumber: string; make: string; model: string; }

type GarageDataTabsProps = {
  recentEvents: RecentEvent[];
  staffMembers?: StaffMember[];
  fleetVehicles?: FleetVehicle[];
}

// Helpers
const formatTierBadge = (tier: string) => {
  switch (tier) {
    case 'tier_1_authoritative': return { label: 'Authoritative', classes: 'bg-amber-500/10 text-amber-600 border-amber-500/20' }
    case 'tier_2_commercial': return { label: 'Garage Verified', classes: 'bg-green-500/10 text-green-600 border-green-500/20' }
    default: return { label: 'Owner Declared', classes: 'bg-muted text-muted-foreground border-border' }
  }
}
const formatEventType = (type: string) => type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')

export function GarageDataTabs({ recentEvents, staffMembers = [], fleetVehicles = [] }: GarageDataTabsProps) {
  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col h-full min-h-[450px]">
      <Tabs defaultValue="events" className="w-full flex flex-col h-full">
        
        {/* TAB NAVIGATION */}
        <div className="p-4 border-b bg-muted/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="events" className="gap-2 px-4 data-[state=active]:shadow-sm">
              <Wrench className="size-4" /> Ledger
            </TabsTrigger>
            <TabsTrigger value="staff" className="gap-2 px-4 data-[state=active]:shadow-sm">
              <Users className="size-4" /> Team
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="gap-2 px-4 data-[state=active]:shadow-sm">
              <CarFront className="size-4" /> Fleet
            </TabsTrigger>
          </TabsList>

          <Button variant="ghost" size="sm" className="h-8 text-xs font-medium">
            View All <ChevronRight className="ml-1 size-3" />
          </Button>
        </div>
        
        {/* TAB CONTENTS */}
        <div className="flex-1 p-0 relative">
          
          {/* RECENT EVENTS TAB */}
          <TabsContent value="events" className="m-0 border-none animate-in fade-in slide-in-from-bottom-2 duration-500">
            {recentEvents.length === 0 ? (
              <EmptyState icon={ShieldCheck} title="No recent events" desc="Register a vehicle to start building your data moat." />
            ) : (
              <div className="w-full overflow-auto max-h-[400px]">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/5 sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="px-5 py-3 font-medium">Asset Reg</th>
                      <th className="px-5 py-3 font-medium">Event Type</th>
                      <th className="px-5 py-3 font-medium">Date Logged</th>
                      <th className="px-5 py-3 font-medium text-right">Trust Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentEvents.map((event) => {
                      const tierBadge = formatTierBadge(event.verificationTier)
                      return (
                        <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3.5 font-bold">{event.regNumber}</td>
                          <td className="px-5 py-3.5 text-muted-foreground font-medium">{formatEventType(event.eventType)}</td>
                          <td className="px-5 py-3.5 text-muted-foreground">
                            {new Intl.DateTimeFormat('en-KE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(event.date))}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", tierBadge.classes)}>
                              {tierBadge.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* STAFF DIRECTORY TAB */}
          <TabsContent value="staff" className="m-0 border-none animate-in fade-in slide-in-from-bottom-2 duration-500">
            {staffMembers.length === 0 ? (
               <EmptyState icon={Users} title="No staff members" desc="Provision a staff account from the Command Center." />
            ) : (
               <div className="w-full overflow-auto max-h-[400px]">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/5 sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="px-5 py-3 font-medium">Member Identity</th>
                      <th className="px-5 py-3 font-medium">Clearance</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {staffMembers.map((staff) => (
                        <tr key={staff.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex flex-col">
                              <span className="font-bold">{staff.name}</span>
                              <span className="text-xs text-muted-foreground">{staff.email}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="capitalize font-medium text-muted-foreground">{staff.role}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              {staff.status === 'active' ? (
                                <><UserCheck className="size-3 text-green-500" /> <span className="text-xs font-medium">Active</span></>
                              ) : (
                                <><UserX className="size-3 text-destructive" /> <span className="text-xs font-medium">Suspended</span></>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* VEHICLE FLEET TAB */}
          <TabsContent value="vehicles" className="m-0 border-none animate-in fade-in slide-in-from-bottom-2 duration-500">
             {fleetVehicles.length === 0 ? (
               <EmptyState icon={CarFront} title="No active fleet" desc="Vehicles serviced by your garage will appear here." />
             ) : (
               <div className="w-full overflow-auto max-h-[400px]">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/5 sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="px-5 py-3 font-medium">Asset Reg</th>
                      <th className="px-5 py-3 font-medium">Make & Model</th>
                      <th className="px-5 py-3 font-medium text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {fleetVehicles.map((vehicle) => (
                        <tr key={vehicle.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3.5">
                             <div className="inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                              {vehicle.regNumber}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-medium">
                            {vehicle.make} {vehicle.model}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                             <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-muted-foreground">
                              View History
                            </Button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
             )}
          </TabsContent>

        </div>
      </Tabs>
    </div>
  )
}

function EmptyState({ icon: Icon, title, desc }: { icon: ElementType, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center p-6">
      <Icon className="size-10 text-muted-foreground/30 mb-3" />
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{desc}</p>
    </div>
  )
}