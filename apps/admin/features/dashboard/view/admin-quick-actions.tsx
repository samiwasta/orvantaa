import { cn } from "@workspace/ui/lib/utils"
import {
  BookOpen,
  GraduationCap,
  Landmark,
  PlusCircle,
  School,
  UserPlus,
} from "lucide-react"
import Link from "next/link"

const actions = [
  {
    label: "Add student",
    description: "Create a new student account",
    href: "/users",
    icon: UserPlus,
    color: "#6C5CE7",
  },
  {
    label: "New school",
    description: "Register a school",
    href: "/schools",
    icon: School,
    color: "#3b82f6",
  },
  {
    label: "New class",
    description: "Set up a class or section",
    href: "/classes",
    icon: GraduationCap,
    color: "#10b981",
  },
  {
    label: "Add content",
    description: "Create subjects or chapters",
    href: "/content",
    icon: BookOpen,
    color: "#f59e0b",
  },
  {
    label: "New board",
    description: "Add an education board",
    href: "/boards",
    icon: Landmark,
    color: "#ec4899",
  },
] as const

export function AdminQuickActions() {
  return (
    <div className="flex flex-col gap-0 overflow-hidden rounded-2xl border bg-white shadow-sm ring-1 ring-black/[0.04]">
      <div className="border-b border-border/50 px-5 py-4">
        <p className="font-heading text-[15px] font-semibold tracking-tight text-foreground">
          Quick actions
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">Common admin tasks</p>
      </div>

      <ul className="flex flex-col divide-y divide-border/50">
        {actions.map((action) => (
          <li key={action.href}>
            <Link
              href={action.href}
              className={cn(
                "flex items-center gap-3 px-5 py-3 transition-colors",
                "hover:bg-muted/30"
              )}
            >
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${action.color}18` }}
              >
                <action.icon className="size-4" style={{ color: action.color }} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
              <PlusCircle className="size-4 shrink-0 text-muted-foreground/50" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
