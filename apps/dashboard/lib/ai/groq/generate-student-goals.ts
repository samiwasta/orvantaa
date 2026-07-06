import { STUDENT_GOALS_SYSTEM_PROMPT } from "../prompts/student-goals"
import { getGroqConfig } from "./config"

type GroqChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | null
    }
  }>
}

function extractJson(raw: string) {
  const trimmed = raw.trim()
  if (trimmed.startsWith("{")) return trimmed

  const match = trimmed.match(/\{[\s\S]*\}/)
  return match?.[0] ?? null
}

export async function generateGroqStudentGoals(
  contextJson: string
): Promise<string | null> {
  const config = getGroqConfig()
  if (!config.enabled) return null

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.35,
        max_tokens: 1200,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: STUDENT_GOALS_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Student context JSON:\n${contextJson}\n\nGenerate goals JSON.`,
          },
        ],
      }),
    }
  )

  const payload = (await response
    .json()
    .catch(() => null)) as GroqChatResponse | null
  if (!response.ok) return null

  const text = payload?.choices?.[0]?.message?.content?.trim()
  if (!text) return null

  return extractJson(text)
}
