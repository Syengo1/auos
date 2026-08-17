import { AuthTabs } from "./auth-tabs"
import { Wrench } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center lg:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      
      {/* Left Branding Panel (Hidden on Mobile/Tablet, visible on Desktop) */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative z-20 flex items-center gap-2 text-lg font-medium">
          <Wrench className="size-6" />
          AutoOS
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This platform has completely transformed how we manage our service bays and track vehicle history. It is the operating system our garage always needed.&rdquo;
            </p>
            <footer className="text-sm">Nairobi Auto Engineering</footer>
          </blockquote>
        </div>
      </div>

      {/* Right Authentication Panel (Fluid on Mobile, constrained on Desktop) */}
      <div className="p-4 sm:p-8 w-full flex items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <AuthTabs />
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}