type AdminSectionPlaceholderProps = {
  title: string
  description: string
}

export function AdminSectionPlaceholder({
  title,
  description,
}: AdminSectionPlaceholderProps) {
  return (
    <div className="flex flex-1 flex-col gap-2 rounded-xl border border-dashed border-border/80 bg-muted/30 px-6 py-10">
      <h2 className="font-heading text-lg font-semibold tracking-tight">
        {title}
      </h2>
      <p className="max-w-xl text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
