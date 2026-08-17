"use client"

import { useActionState, useEffect, useState } from "react"
import type { ElementType } from "react"
import { registerVehicle, type VehicleRegistrationResponse } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ShieldAlert, Car, Bike, BusFront, Truck, Cog } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const POPULAR_MAKES = ["Toyota", "Nissan", "Honda", "Subaru", "Mercedes-Benz", "BMW", "Volkswagen", "Yamaha", "TVS", "Isuzu"]

type CategoryType = "passenger_car" | "motorcycle" | "commercial_van" | "heavy_truck" | "machinery" | "other"

export function AddVehicleModal({ onSuccess }: { onSuccess?: () => void }) {
  const [state, action, isPending] = useActionState<VehicleRegistrationResponse | null, FormData>(registerVehicle, null)
  
  // Dynamic UI States
  const [currentMake, setCurrentMake] = useState("")
  const [category, setCategory] = useState<CategoryType>("passenger_car")

  useEffect(() => {
    if (state?.success === false && state.error) toast.error(state.error)
    if (state?.success === true) {
      toast.success("Asset securely registered and added to the ledger.")
      if (onSuccess) onSuccess()
    }
  }, [state, onSuccess])

  // Smart Heuristic UI Content
  const getIdentifierLabels = () => {
    switch(category) {
      case "motorcycle": return { label: "Frame Number", placeholder: "e.g. MD22-123456" }
      case "machinery": return { label: "Serial / Asset No.", placeholder: "Enter machinery serial" }
      case "commercial_van": return { label: "Chassis Number", placeholder: "Enter chassis (e.g. KDH201)" }
      default: return { label: "VIN / Chassis No.", placeholder: "Enter 5-25 characters" }
    }
  }

  const { label: vinLabel, placeholder: vinPlaceholder } = getIdentifierLabels()

  return (
    <div className="w-full max-w-lg space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Register Asset</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Select the asset type and enter specifications.
          </p>
        </div>
      </div>

      <form action={action} className="grid gap-6">
        
        {/* HIDDEN INPUT TO PASS CATEGORY TO SERVER */}
        <input type="hidden" name="category" value={category} />

        {/* POLYMORPHIC CATEGORY SELECTOR (Massive Touch Targets) */}
        <div className="grid grid-cols-5 gap-2">
          <CategoryBtn id="passenger_car" icon={Car} label="Car" current={category} set={setCategory} />
          <CategoryBtn id="motorcycle" icon={Bike} label="Bike" current={category} set={setCategory} />
          <CategoryBtn id="commercial_van" icon={BusFront} label="Van" current={category} set={setCategory} />
          <CategoryBtn id="heavy_truck" icon={Truck} label="Truck" current={category} set={setCategory} />
          <CategoryBtn id="machinery" icon={Cog} label="Heavy" current={category} set={setCategory} />
        </div>

        {state?.success === false && state.error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive flex gap-2 items-start">
            <ShieldAlert className="size-4 shrink-0 mt-0.5" />
            <p>{state.error}</p>
          </div>
        )}

        {/* DYNAMIC FORMS */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="registrationNumber">Registration / Plate</Label>
            <Input 
              id="registrationNumber" 
              name="registrationNumber" 
              placeholder="e.g. KCA 123A" 
              className="uppercase font-mono tracking-wider"
              maxLength={15}
              disabled={isPending} 
              required 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="vin">{vinLabel}</Label>
            <Input 
              id="vin" 
              name="vin" 
              placeholder={vinPlaceholder}
              className="uppercase font-mono tracking-wider"
              maxLength={25}
              disabled={isPending} 
              required 
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="make">Make / Manufacturer</Label>
            <Input 
              id="make" 
              name="make" 
              list="vehicle-makes" 
              placeholder="e.g. Toyota, Yamaha..." 
              value={currentMake}
              onChange={(e) => setCurrentMake(e.target.value)}
              disabled={isPending} 
              required 
            />
            <datalist id="vehicle-makes">
              {POPULAR_MAKES.map(make => <option key={make} value={make} />)}
            </datalist>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="model">Model</Label>
            <Input 
              id="model" 
              name="model" 
              placeholder={currentMake ? `e.g. Vitz` : "Select a make first"}
              disabled={isPending || !currentMake} 
              required 
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="year">Year</Label>
            <Input 
              id="year" 
              name="year" 
              type="number" 
              min={1950} 
              max={new Date().getFullYear() + 1} 
              placeholder="2019" 
              disabled={isPending} 
              required 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fuelType">Fuel Type</Label>
            <select 
              id="fuelType" 
              name="fuelType" 
              className="flex h-8 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending}
              required
            >
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              {category !== "motorcycle" && (
                <>
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Electric</option>
                </>
              )}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mileage">Mileage (Km)</Label>
            <Input 
              id="mileage" 
              name="mileage" 
              type="number" 
              min={0} 
              placeholder="e.g. 45000" 
              disabled={isPending} 
              required 
            />
          </div>
        </div>

        <Button type="submit" disabled={isPending} className="w-full mt-2 h-10 text-base">
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          Register Asset Securely
        </Button>
      </form>
    </div>
  )
}

// FIX: Strictly typed props for the Sub-component
type CategoryBtnProps = {
  id: CategoryType;
  icon: ElementType;
  label: string;
  current: CategoryType;
  set: (value: CategoryType) => void;
}

function CategoryBtn({ id, icon: Icon, label, current, set }: CategoryBtnProps) {
  const isActive = current === id;
  return (
    <button
      type="button"
      onClick={() => set(id)}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isActive 
          ? "border-primary bg-primary/10 text-primary shadow-sm scale-95" 
          : "border-border bg-card text-muted-foreground hover:bg-muted hover:border-primary/50"
      )}
    >
      <Icon className="size-6" />
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  )
}