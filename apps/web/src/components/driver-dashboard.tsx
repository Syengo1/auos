"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { CarFront, ShieldCheck, FileText, Share2, PlusCircle, Settings2, Gauge, Calendar } from "lucide-react"
import { AddVehicleDialog } from "@/features/vehicles/components/add-vehicle-dialog"
import { cn } from "@/lib/utils"

type Vehicle = {
  id: string;
  regNumber: string;
  year: number | null;
  mileage: number | null;
  make: string;
  model: string;
  fuel: string | null;
}

type DriverDashboardProps = {
  profile: {
    fullName: string;
    contactEmail: string;
  };
  vehicles: Vehicle[];
}

export function DriverDashboard({ profile, vehicles }: DriverDashboardProps) {
  const firstName = profile.fullName.split(' ')[0]

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 delay-300 fill-mode-both">
      {/* HEADER CARD */}
      <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm overflow-hidden relative">
        <div className="absolute -right-10 -top-10 p-6 opacity-[0.03] pointer-events-none">
          <CarFront className="size-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-primary mb-3">
              <ShieldCheck className="size-5" />
              <span className="text-sm font-bold tracking-wider uppercase">Digital Vehicle Passport</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">{firstName}&apos;s Garage</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg leading-relaxed">
              Securely track your vehicle&apos;s history, manage service records, and control who has access to your immutable data ledger.
            </p>
          </div>
          <div className="shrink-0 flex gap-3">
             <AddVehicleDialog>
              <div className={cn(buttonVariants({ size: "default" }), "cursor-pointer shadow-sm")}>
                <PlusCircle className="mr-2 size-4" />
                Register Vehicle
              </div>
            </AddVehicleDialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: VEHICLE FLEET */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight">Active Fleet</h3>
            <span className="text-sm text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full font-medium">
              {vehicles.length} {vehicles.length === 1 ? 'Vehicle' : 'Vehicles'}
            </span>
          </div>

          {vehicles.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-card/50 p-12 text-center flex flex-col items-center">
              <CarFront className="size-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold tracking-tight">No vehicles registered</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-sm">
                Add your first vehicle to start tracking its verified service history and mileage.
              </p>
              <AddVehicleDialog>
                <div className={cn(buttonVariants({ variant: "outline" }), "cursor-pointer")}>
                  Add Your First Vehicle
                </div>
              </AddVehicleDialog>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {vehicles.map((car) => (
                <div key={car.id} className="group rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg leading-none mb-1.5">{car.make} {car.model}</h4>
                      <div className="inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary transition-colors">
                        {car.regNumber}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Settings2 className="size-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium">
                        <Calendar className="size-3.5" /> Year
                      </span>
                      <span className="font-semibold">{car.year || "Unknown"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium">
                        <Gauge className="size-3.5" /> Mileage
                      </span>
                      <span className="font-semibold">{car.mileage?.toLocaleString() || 0} km</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: QUICK ACTIONS & ACTIVITY */}
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
            <h3 className="font-semibold tracking-tight text-sm uppercase text-muted-foreground">Passport Tools</h3>
            <div className="grid gap-2">
              <Button variant="outline" className="w-full justify-start h-12 shadow-sm">
                <FileText className="mr-3 size-4 text-primary" />
                Upload Logbook / Documents
              </Button>
              <Button variant="outline" className="w-full justify-start h-12 shadow-sm">
                <Share2 className="mr-3 size-4 text-primary" />
                Generate Share Link
              </Button>
            </div>
          </div>
          
          {/* Future implementation: Activity Feed */}
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
             <h3 className="font-semibold tracking-tight text-sm uppercase text-muted-foreground mb-4">Recent Activity</h3>
             <div className="text-center p-6 border-2 border-dashed rounded-xl bg-muted/20">
               <p className="text-sm text-muted-foreground">No recent service events.</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}