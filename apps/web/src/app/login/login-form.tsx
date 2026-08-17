"use client"

import { useActionState, useEffect, useSyncExternalStore, Suspense } from "react"
import { useFormStatus } from "react-dom"
import { useRouter, useSearchParams } from "next/navigation"
import { login, signInWithGoogle } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { Loader2, ShieldCheck, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

const emptySubscribe = () => () => {}

// 1. THE DIAGNOSTIC TRIPWIRE
// Isolates URL reading to prevent Next.js from de-optimizing the entire page build
function URLDiagnostics() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const errorMsg = searchParams.get('error')

  useEffect(() => {
    if (errorMsg) {
      // Display the upstream error beautifully
      toast.error(decodeURIComponent(errorMsg))
      // Silently clean the address bar
      router.replace('/login', { scroll: false })
    }
  }, [errorMsg, router])

  return null
}

function GoogleAuthButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button variant="outline" type="submit" className="w-full" disabled={disabled || pending}>
      {pending ? (
        <Loader2 className="mr-2 size-4 animate-spin" />
      ) : (
        <svg className="mr-2 size-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          <path d="M1 1h22v22H1z" fill="none" />
        </svg>
      )}
      {pending ? "Connecting..." : "Google Workspace"}
    </Button>
  )
}

export function LoginForm() {
  const [state, action, isPending] = useActionState(login, null)
  const router = useRouter()
  
  const rememberedName = useSyncExternalStore(emptySubscribe, () => typeof window !== "undefined" ? localStorage.getItem("autoos_last_name") : null, () => null)
  const rememberedEmail = useSyncExternalStore(emptySubscribe, () => typeof window !== "undefined" ? localStorage.getItem("autoos_last_email") || "" : "", () => "")
  
  const showSuccessOverlay = state?.success === true

  useEffect(() => {
    if (state?.success === false && state.error) toast.error(state.error)
    if (state?.success === true) {
      const emailInput = document.getElementById('login-email') as HTMLInputElement
      if (emailInput?.value) localStorage.setItem("autoos_last_email", emailInput.value)
      router.push('/dashboard?welcome=back')
    }
  }, [state, router])

  return (
    <>
      {/* 2. INJECT THE ERROR CATCHER */}
      <Suspense fallback={null}>
        <URLDiagnostics />
      </Suspense>

      {showSuccessOverlay && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-500">
          <div className="flex flex-col items-center space-y-4 animate-in zoom-in-75 duration-700 delay-150 fill-mode-both">
            <div className="flex size-20 items-center justify-center rounded-full bg-green-500/10 text-green-500 ring-1 ring-green-500/20">
              <CheckCircle2 className="size-10" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              {rememberedName ? `Welcome back, ${rememberedName.split(' ')[0]}` : "Welcome back"}
            </h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <p className="text-sm font-medium">Securing connection and booting AutoOS...</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col space-y-6 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {rememberedName ? `Welcome back, ${rememberedName.split(' ')[0]}` : "Welcome back"}
          </h1>
          <p className="text-sm text-muted-foreground">Sign in to your garage dashboard</p>
        </div>
        <div className="grid gap-6">
          <form action={action}>
            <div className="grid gap-4">
              {state?.success === false && state.error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive">{state.error}</div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="login-email">Email Address</Label>
                <Input id="login-email" name="email" type="email" placeholder="john@example.com" defaultValue={rememberedEmail} autoCapitalize="none" autoComplete="email" autoCorrect="off" disabled={isPending || showSuccessOverlay} required />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">Forgot password?</Link>
                </div>
                <PasswordInput id="login-password" name="password" disabled={isPending || showSuccessOverlay} required />
              </div>
              <Button type="submit" disabled={isPending || showSuccessOverlay} className="mt-2">
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                {showSuccessOverlay ? "Authenticating..." : "Secure Sign In"}
              </Button>
            </div>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-medium tracking-wider">Or continue with</span>
            </div>
          </div>

          <form action={signInWithGoogle}>
            <GoogleAuthButton disabled={isPending || showSuccessOverlay} />
          </form>
          
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-2">
            <ShieldCheck className="size-3.5 text-green-500" />
            <span>256-bit Encrypted & DPA Compliant</span>
          </div>
        </div>
      </div>
    </>
  )
}