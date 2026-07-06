export function buildAiTutorGreetingHi(firstName?: string) {
  const name = firstName?.trim()
  if (name) return `Hi ${name}!`
  return "Hi there!"
}

export function buildAiTutorGreetingPrompt() {
  return "What would you like to learn?"
}

export function buildAiTutorGreetingMessage(firstName?: string) {
  const name = firstName?.trim()
  if (name) {
    return `Hi ${name}, what would you like to learn?`
  }
  return "What would you like to learn?"
}
