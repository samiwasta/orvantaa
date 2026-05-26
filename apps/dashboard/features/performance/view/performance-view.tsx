import { PerformanceBentoGrid } from "./performance-bento-grid"

export function PerformanceView() {
  return (
    <div className="flex w-full flex-col gap-4 sm:gap-5">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Your Performance
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground sm:text-base">
          Track your progress and identify areas to improve
        </p>
      </div>

      <PerformanceBentoGrid />
    </div>
  )
}
