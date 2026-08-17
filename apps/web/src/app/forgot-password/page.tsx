"use client"

import { useActionState, useEffect } from "react"
import Link from "next/link"
import { resetPassword } from "./actions"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, MailCheck, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function ForgotPasswordPage() {
  // CORRECTLY importing resetPassword here
  const [state, action, isPending] = useActionState(resetPassword, null)

  useEffect(() => {
    if (state?.success === false && state.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/30 p-4 sm:p-8">
      <div className="mx-auto flex w-full max-w-[350px] flex-col justify-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        
        {state?.success ? (
          <div className="flex flex-col items-center space-y-4 text-center rounded-xl border bg-card p-8 shadow-sm">
            <div className="flex size-12 items-center justify-center rounded-full bg-green-500/10 text-green-500 ring-1 ring-green-500/20">
              <MailCheck className="size-6" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Check your inbox</h1>
            <p className="text-sm text-muted-foreground">
              If an account exists for that email, we have sent a secure recovery link.
            </p>
            
            <div className="w-full space-y-3 mt-4">
              <Link href="/login" className={cn(buttonVariants({ variant: "default" }), "w-full")}>
                Return to sign in
              </Link>
            </div>

            <div className="mt-6 border-t border-border pt-6 w-full">
              <p className="text-xs text-muted-foreground mb-3">
                Didn&apos;t receive an email? You might not have an account yet.
              </p>
              <Link href="/login" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                Create a new account
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
              <p className="text-sm text-muted-foreground">
                Enter your email and we will send you a secure recovery link.
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
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" placeholder="john@example.com" autoCapitalize="none" autoComplete="email" autoCorrect="off" disabled={isPending} required />
                  </div>
                  
                  <Button type="submit" disabled={isPending} className="mt-2">
                    {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Send Recovery Link
                  </Button>
                </div>
              </form>
            </div>

            <div className="flex flex-col items-center gap-4 mt-4">
              <Link href="/login" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="size-4" />
                Back to login
              </Link>

              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-2">
                <ShieldCheck className="size-3.5 text-green-500" />
                <span>Protected by Anti-Enumeration Protocols</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}