export default function DashboardLoading() {
  return (
    <div className="flex flex-1 animate-pulse flex-col gap-4">
      <div className="h-8 w-56 rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-muted/80" />
        ))}
      </div>
    </div>
  )
}
