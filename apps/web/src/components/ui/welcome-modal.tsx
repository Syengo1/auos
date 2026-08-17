"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2, Sparkles } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"

function ModalContent({ name, avatarUrl }: { name: string, avatarUrl: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Derive exact state from the URL parameter
  const welcomeType = searchParams.get("welcome")
  const isWelcome = welcomeType === "new" || welcomeType === "back"
  const isNew = welcomeType === "new"

  useEffect(() => {
    if (isWelcome) {
      // Give new users 3.5 seconds to read the congratulatory text. Returning users get 2.5s.
      const timer = setTimeout(() => {
        router.replace("/dashboard", { scroll: false })
      }, isNew ? 3500 : 2500)
      
      return () => clearTimeout(timer)
    }
  }, [isWelcome, isNew, router])

  if (!isWelcome) return null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md animate-in fade-in duration-500">
      <div className="flex flex-col items-center space-y-6 animate-in zoom-in-90 duration-700 delay-150 fill-mode-both">
        
        <Avatar className="size-24 border-4 border-background shadow-xl ring-2 ring-primary/20">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback className="bg-primary/10 text-3xl text-primary font-medium">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col items-center space-y-3 text-center px-4">
          <div className={`flex items-center gap-2 ${isNew ? 'text-primary' : 'text-green-500'}`}>
            {isNew ? <Sparkles className="size-5" /> : <CheckCircle2 className="size-5" />}
            <span className="font-semibold tracking-wider uppercase text-sm">
              {isNew ? "Account Created" : "Connection Secure"}
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            {isNew ? `Welcome to AutoOS, ${name}` : `Welcome back, ${name}`}
          </h2>
          {isNew && (
            <p className="text-lg text-muted-foreground max-w-md mt-2 animate-in slide-in-from-bottom-2 duration-700 delay-300 fill-mode-both">
              We are thrilled to have you. Let&apos;s boot up your secure workspace.
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3 text-muted-foreground mt-8 bg-muted/50 px-4 py-2 rounded-full">
          <Loader2 className="size-4 animate-spin" />
          <p className="text-sm font-medium">Loading data...</p>
        </div>

      </div>
    </div>
  )
}

export function WelcomeModal({ name, avatarUrl }: { name: string, avatarUrl: string }) {
  return (
    <Suspense fallback={null}>
      <ModalContent name={name} avatarUrl={avatarUrl} />
    </Suspense>
  )
}