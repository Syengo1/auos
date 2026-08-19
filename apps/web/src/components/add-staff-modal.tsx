"use client"

import { useActionState, useEffect } from "react"
import { provisionStaffAccount, type StaffProvisionResponse } from "@/features/tenants/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, UserPlus, ShieldAlert, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

export function AddStaffModal({ onSuccess }: { onSuccess?: () => void }) {
  const [state, action, isPending] = useActionState<StaffProvisionResponse | null, FormData>(provisionStaffAccount, null)

  useEffect(() => {
    if (state?.success === false && state.error) {
      toast.error(state.error)
    }
    if (state?.success === true) {
      toast.success("Secure invitation sent to staff member.")
      if (onSuccess) onSuccess()
    }
  }, [state, onSuccess])

  return (
    <div className="w-full max-w-lg space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Invite Staff</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Send a secure invitation to onboard a new team member.
          </p>
        </div>
        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full hidden sm:block">
          <UserPlus className="size-6" />
        </div>
      </div>

      <form action={action} className="grid gap-6">
        {state?.success === false && state.error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive flex gap-2 items-start">
            <ShieldAlert className="size-4 shrink-0 mt-0.5" />
            <p>{state.error}</p>
          </div>
        )}

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Staff Full Name</Label>
            <Input 
              id="fullName" 
              name="fullName" 
              placeholder="e.g. John Doe" 
              disabled={isPending} 
              required 
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Work Email Address</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="john@yourgarage.com" 
              autoCapitalize="none"
              disabled={isPending} 
              required 
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">Clearance Level</Label>
            <select 
              id="role" 
              name="role" 
              className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending}
              required
            >
              <option value="mechanic">Mechanic</option>
              <option value="manager">Manager</option>
              <option value="intern">Intern</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Send Secure Invitation
          </Button>
          <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            <ShieldCheck className="size-3.5 text-green-500" />
            <span>Identity provisioned via Zero-Knowledge protocol</span>
          </div>
        </div>
      </form>
    </div>
  )
}