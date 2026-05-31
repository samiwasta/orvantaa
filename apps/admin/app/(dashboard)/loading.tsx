export default function DashboardLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-muted/80" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-muted/60" />
    </div>
  )
}
