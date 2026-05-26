export type ChatRole = "user" | "assistant"

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  timestamp: Date
}

export type ChatSession = {
  id: string
  title: string
  messages: ChatMessage[]
  updatedAt: Date
}

export type SuggestedPrompt = {
  id: string
  label: string
  prompt: string
}

export const NEW_CHAT_ID = "new"

export function aiTutorChatHref(chatId: string) {
  return `/ai-tutor/${chatId}`
}

export const suggestedPrompts: SuggestedPrompt[] = [
  {
    id: "explain-concept",
    label: "Explain a concept",
    prompt: "Explain Newton's third law with real-life examples",
  },
  {
    id: "solve-problem",
    label: "Solve a problem",
    prompt: "Solve: A car travels 120km in 2 hours. What is its average speed?",
  },
  {
    id: "quiz-me",
    label: "Quiz me",
    prompt: "Give me 5 MCQs on photosynthesis",
  },
  {
    id: "summarize",
    label: "Summarize a chapter",
    prompt: "Summarize the chapter on Chemical Reactions and Equations",
  },
]

let messageIdCounter = 0
let sessionIdCounter = 0

export function createMessageId(): string {
  messageIdCounter += 1
  return `msg-${messageIdCounter}`
}

export function createSessionId(): string {
  sessionIdCounter += 1
  return `session-${sessionIdCounter}`
}

export function titleFromFirstMessage(content: string): string {
  const trimmed = content.trim()
  if (trimmed.length <= 48) return trimmed
  return `${trimmed.slice(0, 48)}…`
}

export const mockChatHistory: ChatSession[] = [
  {
    id: "session-1",
    title: "Newton's Third Law",
    updatedAt: new Date("2026-05-26T10:30:00"),
    messages: [
      {
        id: "msg-h1",
        role: "user",
        content: "Explain Newton's third law with real-life examples",
        timestamp: new Date("2026-05-26T10:30:00"),
      },
      {
        id: "msg-h2",
        role: "assistant",
        content:
          "Newton's Third Law states that for every action, there is an equal and opposite reaction. For example, when you push a wall, the wall pushes back on your hand with the same force.",
        timestamp: new Date("2026-05-26T10:30:15"),
      },
    ],
  },
  {
    id: "session-2",
    title: "Average speed problem",
    updatedAt: new Date("2026-05-25T16:00:00"),
    messages: [
      {
        id: "msg-h3",
        role: "user",
        content:
          "Solve: A car travels 120km in 2 hours. What is its average speed?",
        timestamp: new Date("2026-05-25T16:00:00"),
      },
      {
        id: "msg-h4",
        role: "assistant",
        content:
          "Average Speed = Total Distance / Total Time = 120 km / 2 hours = **60 km/h**",
        timestamp: new Date("2026-05-25T16:00:20"),
      },
    ],
  },
  {
    id: "session-3",
    title: "Photosynthesis MCQs",
    updatedAt: new Date("2026-05-24T09:15:00"),
    messages: [
      {
        id: "msg-h5",
        role: "user",
        content: "Give me 5 MCQs on photosynthesis",
        timestamp: new Date("2026-05-24T09:15:00"),
      },
      {
        id: "msg-h6",
        role: "assistant",
        content:
          "Here are 5 MCQs on Photosynthesis:\n\n**Q1.** Which organelle is responsible for photosynthesis?\na) Mitochondria  b) Chloroplast  c) Ribosome  d) Nucleus",
        timestamp: new Date("2026-05-24T09:15:30"),
      },
    ],
  },
  {
    id: "session-4",
    title: "Chemical Reactions summary",
    updatedAt: new Date("2026-05-22T14:45:00"),
    messages: [
      {
        id: "msg-h7",
        role: "user",
        content: "Summarize the chapter on Chemical Reactions and Equations",
        timestamp: new Date("2026-05-22T14:45:00"),
      },
      {
        id: "msg-h8",
        role: "assistant",
        content:
          "**Chemical Reactions and Equations — Summary:**\n\n1. A chemical reaction involves the transformation of reactants into products\n2. Equations must be balanced (Law of Conservation of Mass)",
        timestamp: new Date("2026-05-22T14:45:25"),
      },
    ],
  },
]

export function createMockAssistantReply(userMessage: string): string {
  const lower = userMessage.toLowerCase()
  if (lower.includes("newton"))
    return "Newton's Third Law states that for every action, there is an equal and opposite reaction. For example, when you push a wall, the wall pushes back on your hand with the same force. When a rocket launches, the exhaust gases push downward, and the rocket is propelled upward."
  if (lower.includes("speed") || lower.includes("km"))
    return "To find the average speed:\n\nAverage Speed = Total Distance / Total Time\n= 120 km / 2 hours\n= **60 km/h**\n\nThe car's average speed is 60 kilometers per hour."
  if (lower.includes("photosynthesis") || lower.includes("mcq"))
    return "Here are 5 MCQs on Photosynthesis:\n\n**Q1.** Which organelle is responsible for photosynthesis?\na) Mitochondria  b) Chloroplast  c) Ribosome  d) Nucleus\n\n**Q2.** What is the primary pigment in photosynthesis?\na) Xanthophyll  b) Carotenoid  c) Chlorophyll  d) Anthocyanin\n\n**Q3.** CO₂ enters the leaf through:\na) Stomata  b) Cuticle  c) Epidermis  d) Veins\n\n**Q4.** The by-product of photosynthesis is:\na) CO₂  b) Water  c) Oxygen  d) Glucose\n\n**Q5.** Photosynthesis is an:\na) Exothermic process  b) Endothermic process  c) Both  d) Neither"
  if (lower.includes("chemical reaction") || lower.includes("summarize"))
    return "**Chemical Reactions and Equations — Summary:**\n\n1. A chemical reaction involves the transformation of reactants into products\n2. Chemical equations are symbolic representations of reactions\n3. Equations must be balanced (Law of Conservation of Mass)\n4. Types include: Combination, Decomposition, Displacement, Double displacement, and Redox reactions\n5. Oxidation is gain of oxygen/loss of hydrogen; Reduction is the opposite"
  return "That's a great question! I'd be happy to help you understand this topic better. Could you provide a bit more context about which subject or chapter this relates to? I can then give you a detailed explanation with examples."
}
