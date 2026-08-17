"use client"

import { CarFront, Activity, ShieldCheck, Clock } from "lucide-react"

type GarageMetricsProps = {
  garage: {
    name: string;
    slug: string;
    isVerified: boolean | null;
  };
  metrics?: {
    totalVehiclesServiced: number;
    dataAccuracyScore: number;
  };
}

export function GarageMetrics({ garage, metrics }: GarageMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col justify-between group hover:border-primary/30 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-tight uppercase text-muted-foreground">Vehicles Serviced</h2>
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <CarFront className="size-4" />
          </div>
        </div>
        <div>
          <h3 className="text-4xl font-bold">{metrics?.totalVehiclesServiced || 0}</h3>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Total unique assets tracked</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col justify-between group hover:border-primary/30 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-tight uppercase text-muted-foreground">Active Work Orders</h2>
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
            <Clock className="size-4" />
          </div>
        </div>
        <div>
          <h3 className="text-4xl font-bold">0</h3>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Jobs currently in progress</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-primary/30 transition-colors">
        <div className="absolute right-0 top-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
          <Activity className="size-24 text-primary" />
        </div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h2 className="text-sm font-semibold tracking-tight uppercase text-muted-foreground">Data Trust Score</h2>
          <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
            <ShieldCheck className="size-4" />
          </div>
        </div>
        <div className="relative z-10">
          <div className="flex items-baseline gap-1">
            <h3 className="text-4xl font-bold text-primary">{metrics?.dataAccuracyScore || 100}</h3>
            <span className="text-xl font-bold text-primary">%</span>
          </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
            {garage.isVerified ? "Tier-2 Authority Active" : "Pending Platform Verification"}
          </p>
        </div>
      </div>
    </div>
  )
}