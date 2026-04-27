export function getTimeBasedSalutation(hour: number): string {
  if (hour >= 5 && hour < 12) return "Good morning"
  if (hour >= 12 && hour < 17) return "Good afternoon"
  if (hour >= 17 && hour < 22) return "Good evening"
  if (hour >= 22 || hour < 5) return "Good night"
  return "Good evening"
}
