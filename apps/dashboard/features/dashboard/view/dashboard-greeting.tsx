import { getTimeBasedSalutation } from "../model/time-based-greeting"

export function DashboardGreeting({
  firstName,
  serverHour,
}: {
  firstName: string
  serverHour: number
}) {
  const salutation = getTimeBasedSalutation(serverHour)
  const name = firstName.trim() || "there"

  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground md:text-2xl">
        {salutation}, {name}! 👋🏻
      </h2>
      <p className="text-base text-muted-foreground">
        Let&apos;s start your learning journey.
      </p>
    </div>
  )
}
