import { getTimeBasedSalutation } from "../model/time-based-greeting"

export function DashboardGreeting({
  firstName,
  serverHour,
  hasLearningActivity,
}: {
  firstName: string
  serverHour: number
  hasLearningActivity: boolean
}) {
  const salutation = getTimeBasedSalutation(serverHour)
  const name = firstName.trim() || "there"

  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground md:text-2xl">
        {salutation}, {name}! 👋🏻
      </h2>
      <p className="text-base text-muted-foreground">
        {hasLearningActivity
          ? "Welcome back. Pick up where you left off."
          : "Let's start your learning journey."}
      </p>
    </div>
  )
}
