import { cn } from "@workspace/ui/lib/utils"

import { BrandLogo } from "@/features/brand/view/brand-logo"

type AuthPageShellProps = {
  children: React.ReactNode
  className?: string
}

export function AuthPageShell({ children, className }: AuthPageShellProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-dvh items-center justify-center overflow-x-hidden overflow-y-auto bg-[#F4F6FB] px-4 py-8 sm:px-6 sm:py-10",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#E4EBFF_0%,_transparent_50%),radial-gradient(ellipse_at_bottom_right,_#FFE8D6_0%,_transparent_48%)]"
      />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  )
}

type AuthCardProps = {
  children: React.ReactNode
  className?: string
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[26rem] rounded-3xl border border-[#E4E9F5] bg-white p-7 shadow-[0_24px_60px_-28px_rgba(45,70,140,0.28)] sm:p-8",
        className
      )}
    >
      {children}
    </div>
  )
}

export function AuthBrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex justify-center", className)}>
      <BrandLogo size="md" priority />
    </div>
  )
}

export function AuthGateLoading() {
  return (
    <AuthPageShell>
      <AuthCard>
        <div className="flex flex-col items-center gap-4 py-8">
          <AuthBrandMark />
          <div
            className="size-8 animate-spin rounded-full border-2 border-[#4169E1]/25 border-t-[#4169E1]"
            aria-label="Loading"
          />
        </div>
      </AuthCard>
    </AuthPageShell>
  )
}
