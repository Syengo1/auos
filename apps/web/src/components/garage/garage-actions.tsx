"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { Wrench, FileSpreadsheet, Plus, UserPlus } from "lucide-react"
import { AddVehicleDialog } from "@/features/vehicles/components/add-vehicle-dialog"
import { AddStaffDialog } from "@/components/add-staff-dialog"
import { CreateJobDialog } from "@/features/job-cards/components/create-job-dialog"
import { cn } from "@/lib/utils"
import type { FleetVehicle } from "./garage-data-tabs"

export function GarageActions({ garageId, fleetVehicles }: { garageId: string, fleetVehicles: FleetVehicle[] }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <h3 className="font-semibold tracking-tight text-sm uppercase text-muted-foreground mb-4">Command Center</h3>
      
      <div className="flex flex-col gap-3">
        {/* 1. ASSET REGISTRATION */}
        <AddVehicleDialog>
          <div className={cn(buttonVariants({ size: "lg" }), "w-full justify-start h-14 cursor-pointer shadow-sm")}>
            <Plus className="mr-3 size-5" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Register New Asset</span>
              <span className="text-[10px] opacity-70 font-normal">Add vehicle to platform</span>
            </div>
          </div>
        </AddVehicleDialog>

        {/* 2. STAFF PROVISIONING */}
        <AddStaffDialog>
          <div className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full justify-start h-14 cursor-pointer shadow-sm border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10")}>
            <UserPlus className="mr-3 size-5 text-blue-500" />
            <div className="flex flex-col items-start">
              <span className="font-semibold text-blue-600 dark:text-blue-400">Provision Staff</span>
              <span className="text-[10px] opacity-70 font-normal text-blue-600/80 dark:text-blue-400/80">Manage team clearances</span>
            </div>
          </div>
        </AddStaffDialog>
        
        <div className="relative mt-2 mb-1">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-card px-2 text-muted-foreground font-medium tracking-wider">Service Operations</span>
          </div>
        </div>

        {/* NEW: Activated Service Logging Trigger */}
        <CreateJobDialog garageId={garageId} fleetVehicles={fleetVehicles}>
          <div className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full justify-start h-12 cursor-pointer shadow-sm")}>
            <Wrench className="mr-3 size-4 text-primary" />
            Log Service Event
          </div>
        </CreateJobDialog>

        <Button size="lg" variant="outline" className="w-full justify-start h-12 shadow-sm">
          <FileSpreadsheet className="mr-3 size-4 text-primary" />
          Generate Invoice
        </Button>
      </div>
    </div>
  )
}