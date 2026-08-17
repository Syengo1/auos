"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { provisionGarageTenant, provisionDriverProfile } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wrench, CarFront, Loader2 } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<"garage" | "driver" | null>(null)
  const [isProvisioning, setIsProvisioning] = useState(false)

  const handleDriverProvision = async () => {
    setIsProvisioning(true)
    await provisionDriverProfile()
    router.push('/dashboard?welcome=new')
  }

  const handleGarageProvision = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsProvisioning(true)
    const formData = new FormData(e.currentTarget)
    await provisionGarageTenant(formData)
    router.push('/dashboard?welcome=new')
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/30 p-4 sm:p-8">
      <div className="w-full max-w-2xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">How will you use AutoOS?</h1>
          <p className="text-muted-foreground">Select your primary role to configure your workspace.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          
          {/* DRIVER OPTION */}
          <button 
            onClick={() => setSelectedRole("driver")}
            className={`relative flex flex-col items-center text-center p-8 rounded-2xl border-2 transition-all hover:border-primary/50 hover:bg-primary/5 focus:outline-none ${selectedRole === "driver" ? "border-primary bg-primary/5 shadow-md" : "border-border bg-card"}`}
          >
            <div className="p-4 rounded-full bg-blue-500/10 text-blue-500 mb-4">
              <CarFront className="size-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Vehicle Owner</h2>
            <p className="text-sm text-muted-foreground">
              Access your digital vehicle passport, track service history, and monitor verification records.
            </p>
          </button>

          {/* GARAGE OPTION */}
          <button 
            onClick={() => setSelectedRole("garage")}
            className={`relative flex flex-col items-center text-center p-8 rounded-2xl border-2 transition-all hover:border-primary/50 hover:bg-primary/5 focus:outline-none ${selectedRole === "garage" ? "border-primary bg-primary/5 shadow-md" : "border-border bg-card"}`}
          >
            <div className="p-4 rounded-full bg-amber-500/10 text-amber-500 mb-4">
              <Wrench className="size-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Garage Partner</h2>
            <p className="text-sm text-muted-foreground">
              Manage your service bays, onboard client vehicles, and earn a verified partner score.
            </p>
          </button>

        </div>

        {/* DYNAMIC PROVISIONING AREA */}
        <div className="flex justify-center mt-8 min-h-[100px]">
          {selectedRole === "driver" && (
            <div className="flex flex-col items-center space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <p className="text-sm font-medium">Configure as Vehicle Owner</p>
              <Button onClick={handleDriverProvision} disabled={isProvisioning} size="lg" className="w-[250px]">
                {isProvisioning ? <Loader2 className="mr-2 size-4 animate-spin" /> : "Complete Setup"}
              </Button>
            </div>
          )}

          {selectedRole === "garage" && (
            <div className="w-full max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
              <form onSubmit={handleGarageProvision} className="flex flex-col space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="garageName">Garage Business Name</Label>
                  <Input id="garageName" name="garageName" placeholder="e.g. Nairobi Auto Engineering" disabled={isProvisioning} required />
                </div>
                <Button type="submit" disabled={isProvisioning} size="lg">
                  {isProvisioning ? <Loader2 className="mr-2 size-4 animate-spin" /> : "Provision Garage Tenant"}
                </Button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}