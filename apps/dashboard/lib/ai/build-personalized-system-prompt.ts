import type { AiTutorUserFeedbackProfile } from "@/features/ai-tutor/repository/ai-tutor-feedback.repository"

import { AI_TUTOR_SYSTEM_PROMPT } from "./prompts"

function averageLength(samples: Array<{ content: string }>) {
  if (samples.length === 0) return 0
  return Math.round(
    samples.reduce((sum, sample) => sum + sample.content.length, 0) /
      samples.length
  )
}

function buildPreferenceGuidance(profile: AiTutorUserFeedbackProfile) {
  const lines: string[] = []

  if (profile.likeCount > 0 || profile.disliked.length > 0) {
    lines.push(
      `This student has rated ${profile.likeCount} replies positively and ${profile.dislikeCount} negatively.`
    )
  }

  const likedAvg = averageLength(profile.liked)
  const dislikedAvg = averageLength(profile.disliked)

  if (likedAvg > 0 && dislikedAvg > 0) {
    if (likedAvg < dislikedAvg - 40) {
      lines.push(
        "They tend to prefer shorter, tighter answers over long explanations."
      )
    } else if (likedAvg > dislikedAvg + 40) {
      lines.push(
        "They tend to prefer fuller step-by-step explanations over very brief answers."
      )
    }
  }

  if (profile.liked.length > 0) {
    lines.push("Replies they liked (mirror this tone, structure, and depth):")
    for (const sample of profile.liked.slice(0, 4)) {
      lines.push(`- "${sample.content}"`)
    }
  }

  if (profile.disliked.length > 0) {
    lines.push("Replies they disliked (avoid this tone, structure, and depth):")
    for (const sample of profile.disliked.slice(0, 4)) {
      lines.push(`- "${sample.content}"`)
    }
  }

  if (lines.length === 0) {
    return ""
  }

  return [
    "Student-specific personalization (from this user's thumbs up/down on past replies):",
    ...lines,
    "Apply these preferences to phrasing, length, and teaching style. Do not mention ratings or this personalization block.",
  ].join("\n")
}

export function buildPersonalizedAiTutorSystemPrompt(
  profile: AiTutorUserFeedbackProfile,
  basePrompt: string = AI_TUTOR_SYSTEM_PROMPT
) {
  const guidance = buildPreferenceGuidance(profile)
  if (!guidance) {
    return basePrompt
  }

  return `${basePrompt}\n\n${guidance}`
}
