import { STUDENT_GOALS_SYSTEM_PROMPT } from "../prompts/student-goals"
import { getGeminiConfig } from "./config"
import { assertGeminiConfigured } from "./errors"

function extractJson(raw: string) {
  const trimmed = raw.trim()
  if (trimmed.startsWith("{")) return trimmed

  const match = trimmed.match(/\{[\s\S]*\}/)
  return match?.[0] ?? null
}

export async function generateGeminiStudentGoals(
  contextJson: string
): Promise<string | null> {
  assertGeminiConfigured()
  const config = getGeminiConfig()
  const model = config.model

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 1200,
          responseMimeType: "application/json",
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${STUDENT_GOALS_SYSTEM_PROMPT}\n\nStudent context JSON:\n${contextJson}\n\nGenerate goals JSON.`,
              },
            ],
          },
        ],
      }),
    }
  )

  const payload = (await response.json().catch(() => null)) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> }
    }>
  } | null

  if (!response.ok) return null

  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  if (!text) return null

  return extractJson(text)
}
