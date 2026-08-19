"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  provisionGarageTenant, 
  provisionDriverProfile, 
  getStaffInviteContext, 
  continueAsStaffOnly,
  cancelAndSignOut 
} from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wrench, CarFront, Loader2, UserCheck, ArrowLeft, } from "lucide-react"

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isStaffDetected = searchParams.get("detected") === "staff"

  const [staffWorkspace, setStaffWorkspace] = useState<{ name: string; garageId: string; role: string } | null>(null)
  const [selectedRole, setSelectedRole] = useState<"garage" | "driver" | null>(null)
  const [isProvisioning, setIsProvisioning] = useState(false)

  useEffect(() => {
    if (isStaffDetected) {
      getStaffInviteContext().then((res) => {
        if (res) {
          setStaffWorkspace({
            name: res.workspace.name,
            garageId: res.workspace.id,
            role: res.staffInfo.role
          })
        }
      })
    }
  }, [isStaffDetected])

  const handleStaffDirect = async () => {
    if (!staffWorkspace) return
    setIsProvisioning(true)
    await continueAsStaffOnly(staffWorkspace.garageId)
    router.push('/dashboard?welcome=back')
  }

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

  if (isStaffDetected && staffWorkspace) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted/30 p-4 sm:p-8">
        <div className="w-full max-w-xl space-y-8 animate-in fade-in zoom-in-95 duration-500 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold uppercase tracking-wider">
            <UserCheck className="size-4" /> Team Membership Detected
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Welcome to {staffWorkspace.name}</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              You are provisioned as <span className="font-semibold capitalize text-foreground">{staffWorkspace.role}</span>. How would you like to set up your account?
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-left">
            {/* OPTION 1: Pure Staff Desk */}
            <div className="rounded-2xl border bg-card p-6 flex flex-col justify-between hover:border-primary transition-all shadow-sm">
              <div>
                <div className="p-3 bg-primary/10 text-primary w-fit rounded-xl mb-3">
                  <Wrench className="size-6" />
                </div>
                <h3 className="font-bold text-lg">Staff Workbench</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Access assigned service bays and vehicle ledgers for {staffWorkspace.name}.
                </p>
              </div>
              <Button onClick={handleStaffDirect} disabled={isProvisioning} className="mt-6 w-full">
                {isProvisioning ? <Loader2 className="size-4 animate-spin" /> : "Continue as Staff"}
              </Button>
            </div>

            {/* OPTION 2: Create Personal Driver Account */}
            <div className="rounded-2xl border bg-card p-6 flex flex-col justify-between hover:border-primary transition-all shadow-sm border-blue-500/30 bg-blue-500/5">
              <div>
                <div className="p-3 bg-blue-500/10 text-blue-500 w-fit rounded-xl mb-3">
                  <CarFront className="size-6" />
                </div>
                <h3 className="font-bold text-lg">Personal Passport</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Track your own vehicles and link your staff profile for 1-click workspace switching.
                </p>
              </div>
              <Button onClick={handleDriverProvision} disabled={isProvisioning} variant="outline" className="mt-6 w-full border-blue-500/40 hover:bg-blue-500/10">
                {isProvisioning ? <Loader2 className="size-4 animate-spin" /> : "Create & Link Passport"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/30 p-4 sm:p-8">
      <div className="w-full max-w-2xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">How will you use AutoOS?</h1>
          <p className="text-muted-foreground">Select your primary role to configure your workspace.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
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

          <button 
            onClick={() => setSelectedRole("garage")}
            className={`relative flex flex-col items-center text-center p-8 rounded-2xl border-2 transition-all hover:border-primary/50 hover:bg-primary/5 focus:outline-none ${selectedRole === "garage" ? "border-primary bg-primary/5 shadow-md" : "border-border bg-card"}`}
          >
            <div className="p-4 rounded-full bg-amber-500/10 text-amber-500 mb-4">
              <Wrench className="size-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Garage Partner</h2>
            <p className="text-sm text-muted-foreground">
              Manage service bays, onboard client vehicles, and earn a verified partner score.
            </p>
          </button>
        </div>

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

export default function OnboardingPage() {
  return (
    <>
      {/* THE ZERO-TRACE ESCAPE HATCH */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-50 animate-in fade-in duration-500">
        <form action={cancelAndSignOut}>
          <Button variant="ghost" type="submit" className="text-muted-foreground hover:text-foreground bg-background/50 backdrop-blur-sm border shadow-sm rounded-full px-4">
            <ArrowLeft className="mr-2 size-4" />
            Cancel & Return to Login
          </Button>
        </form>
      </div>

      <Suspense fallback={null}>
        <OnboardingContent />
      </Suspense>
    </>
  )
}