"use client"

import { Button } from "@workspace/ui/components/button"
import { useEffect } from "react"

type DashboardErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
      <p className="text-sm font-medium text-foreground">
        Something went wrong loading this page.
      </p>
      <p className="max-w-md text-sm text-muted-foreground">
        Try again. If the problem continues, check your database connection and
        refresh the page.
      </p>
      <Button type="button" onClick={reset} className="rounded-xl">
        Try again
      </Button>
    </div>
  )
}
