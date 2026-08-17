"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { updatePassword } from "./actions"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { Loader2, ShieldCheck, KeyRound } from "lucide-react"
import { toast } from "sonner"

export default function UpdatePasswordPage() {
  const [state, action, isPending] = useActionState(updatePassword, null)
  const router = useRouter()

  useEffect(() => {
    if (state?.success === false && state.error) {
      toast.error(state.error)
    }
    if (state?.success === true) {
      toast.success("Password updated successfully.")
      // Route back to the dashboard with the returning user animation
      setTimeout(() => {
        router.push('/dashboard?welcome=back')
      }, 1500)
    }
  }, [state, router])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/30 p-4 sm:p-8">
      <div className="mx-auto flex w-full max-w-[350px] flex-col justify-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="flex flex-col items-center space-y-2 text-center mb-2">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
            <KeyRound className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Secure your account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your new password below.
          </p>
        </div>

        <div className="grid gap-6">
          <form action={action}>
            <div className="grid gap-4">
              
              {state?.success === false && state.error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive">
                  {state.error}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <PasswordInput 
                  id="password" 
                  name="password" 
                  minLength={8} 
                  disabled={isPending || state?.success} 
                  required 
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <PasswordInput 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  minLength={8} 
                  disabled={isPending || state?.success} 
                  required 
                />
              </div>
              
              <Button type="submit" disabled={isPending || state?.success} className="mt-4">
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                {state?.success ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-4">
          <ShieldCheck className="size-3.5 text-green-500" />
          <span>Session securely verified via Email PKCE</span>
        </div>

      </div>
    </div>
  )
}