"use client"

import { Wrench, BadgeCheck } from "lucide-react"
import { GarageMetrics } from "./garage/garage-metrics"
import { GarageActions } from "./garage/garage-actions"
import { GarageDataTabs, type StaffMember, type FleetVehicle } from "./garage/garage-data-tabs"

// Type Definitions
type RecentEvent = {
  id: string;
  eventType: string;
  date: Date;
  regNumber: string;
  verificationTier: string;
}

type GarageDashboardProps = {
  garage: {
    id: string; // <--- FIX: Added the missing id property
    name: string;
    slug: string;
    isVerified: boolean | null;
  };
  metrics?: {
    totalVehiclesServiced: number;
    dataAccuracyScore: number;
  };
  recentEvents?: RecentEvent[];
  staffMembers?: StaffMember[];
  fleetVehicles?: FleetVehicle[];
}

export function GarageDashboard({ garage, metrics, recentEvents = [], staffMembers = [], fleetVehicles = [] }: GarageDashboardProps) {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 delay-300 fill-mode-both">
      
      {/* BRANDING HERO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {garage.isVerified ? (
              <BadgeCheck className="size-5 text-green-500" />
            ) : (
              <Wrench className="size-5 text-primary" />
            )}
            <span className="text-sm font-bold tracking-wider uppercase text-muted-foreground">
              Commercial Workspace
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{garage.name}</h1>
          <p className="font-mono text-sm text-muted-foreground mt-1">auto-os.com/{garage.slug}</p>
        </div>
      </div>

      {/* MODULAR COMPONENTS */}
      <GarageMetrics garage={garage} metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GarageDataTabs 
            recentEvents={recentEvents} 
            staffMembers={staffMembers}
            fleetVehicles={fleetVehicles}
          />
        </div>
        <div>
          <GarageActions garageId={garage.id} fleetVehicles={fleetVehicles} />
        </div>
      </div>
      
    </div>
  )
}