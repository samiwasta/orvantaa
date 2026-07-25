export const PROCTOR_WARNING_LIMIT = 3

/**
 * A single action can fire several browser events (a tab switch triggers both
 * `blur` and `visibilitychange`). Warnings raised inside this window collapse
 * into the first one so a student is never punished twice for one action.
 */
export const PROCTOR_WARNING_COOLDOWN_MS = 4000

/** How long the blank capture shield stays up after a screenshot / print attempt. */
export const PROCTOR_BLANK_SCREEN_MS = 2800

/** Ignore face/voice heuristics for a short settle period after start. */
export const PROCTOR_BEHAVIOR_WARMUP_MS = 4000

export const PROCTOR_VIOLATION_KINDS = [
  "TAB_HIDDEN",
  "WINDOW_BLUR",
  "FULLSCREEN_EXIT",
  "PAGE_RELOAD",
  "COPY_ATTEMPT",
  "PASTE_ATTEMPT",
  "CONTEXT_MENU",
  "DEVTOOLS_SHORTCUT",
  "PRINT_ATTEMPT",
  "SCREEN_CAPTURE_SHORTCUT",
  "CAMERA_DISABLED",
  "MIC_DISABLED",
  "NO_FACE_DETECTED",
  "MULTIPLE_FACES",
  "CAMERA_OBSTRUCTED",
  "CAMERA_FROZEN",
  "SPEECH_DETECTED",
] as const

export type ProctorViolationKind = (typeof PROCTOR_VIOLATION_KINDS)[number]

export const PROCTOR_SESSION_STATUSES = [
  "IN_PROGRESS",
  "COMPLETED",
  "ABANDONED",
  "TERMINATED",
] as const

export type ProctorSessionStatus = (typeof PROCTOR_SESSION_STATUSES)[number]

type ProctorViolationRule = {
  /** Warnings move the student closer to termination, notices are only logged. */
  countsAsWarning: boolean
  label: string
  title: string
  message: string
  guidance: string
}

const RULES: Record<ProctorViolationKind, ProctorViolationRule> = {
  TAB_HIDDEN: {
    countsAsWarning: true,
    label: "Left the quiz tab",
    title: "You left the quiz tab",
    message:
      "The quiz tab was hidden or another tab was opened while the attempt was running.",
    guidance: "Keep this tab open and in view until you finish the quiz.",
  },
  WINDOW_BLUR: {
    countsAsWarning: true,
    label: "Switched away from the window",
    title: "You switched away from the quiz",
    message:
      "The quiz window lost focus, which usually means another app or window was opened.",
    guidance: "Close other apps and stay on this window while answering.",
  },
  FULLSCREEN_EXIT: {
    countsAsWarning: true,
    label: "Exited fullscreen",
    title: "You left fullscreen",
    message:
      "Proctored quizzes run in fullscreen so nothing else distracts you.",
    guidance: "Continue to go back to fullscreen and resume the quiz.",
  },
  PAGE_RELOAD: {
    countsAsWarning: true,
    label: "Reloaded the quiz",
    title: "The quiz page was reloaded",
    message:
      "Reloading or reopening a running attempt is tracked, and your earlier warnings carry over.",
    guidance: "Finish the quiz in one go without refreshing the page.",
  },
  PASTE_ATTEMPT: {
    countsAsWarning: true,
    label: "Tried to paste content",
    title: "Pasting is not allowed",
    message: "Pasting content into a proctored quiz is treated as malpractice.",
    guidance: "Type your own answers, no pasting from other sources.",
  },
  DEVTOOLS_SHORTCUT: {
    countsAsWarning: true,
    label: "Used a developer tools shortcut",
    title: "Developer tools are blocked",
    message:
      "A shortcut used to open browser developer tools or the page source was detected.",
    guidance: "Stick to the quiz interface, developer tools stay closed.",
  },
  PRINT_ATTEMPT: {
    countsAsWarning: true,
    label: "Tried to print or save the quiz",
    title: "Printing is not allowed",
    message: "Printing or saving quiz questions is treated as malpractice.",
    guidance: "Answer on screen, the questions cannot be exported.",
  },
  COPY_ATTEMPT: {
    countsAsWarning: false,
    label: "Tried to copy the question",
    title: "Copying is disabled",
    message: "Quiz questions cannot be copied.",
    guidance: "This one is only noted, not counted as a warning.",
  },
  CONTEXT_MENU: {
    countsAsWarning: false,
    label: "Opened the right-click menu",
    title: "Right-click is disabled",
    message: "The right-click menu is turned off during a proctored quiz.",
    guidance: "This one is only noted, not counted as a warning.",
  },
  SCREEN_CAPTURE_SHORTCUT: {
    countsAsWarning: true,
    label: "Tried to take a screenshot",
    title: "Screenshots are not allowed",
    message:
      "A screenshot or screen recording shortcut was detected. The quiz view was blanked.",
    guidance: "Do not capture the screen during a proctored quiz.",
  },
  CAMERA_DISABLED: {
    countsAsWarning: true,
    label: "Camera turned off",
    title: "Camera was turned off",
    message:
      "Your camera stopped during the attempt. Video must stay on for the whole quiz.",
    guidance: "Keep the camera enabled and pointed at you until you finish.",
  },
  MIC_DISABLED: {
    countsAsWarning: true,
    label: "Microphone turned off",
    title: "Microphone was turned off",
    message:
      "Your microphone stopped during the attempt. Audio must stay on for the whole quiz.",
    guidance: "Keep the microphone enabled until you finish.",
  },
  NO_FACE_DETECTED: {
    countsAsWarning: true,
    label: "Face not visible",
    title: "Your face left the camera",
    message:
      "The proctoring system could not see your face for several seconds.",
    guidance: "Sit facing the camera with your full face clearly visible.",
  },
  MULTIPLE_FACES: {
    countsAsWarning: true,
    label: "Another person detected",
    title: "More than one face was detected",
    message: "Someone else appeared in the camera frame during the attempt.",
    guidance: "Stay alone in a quiet place while taking the quiz.",
  },
  CAMERA_OBSTRUCTED: {
    countsAsWarning: true,
    label: "Camera covered",
    title: "Camera view was blocked",
    message:
      "The camera feed went too dark, which usually means the lens was covered.",
    guidance: "Keep the camera uncovered and well lit.",
  },
  CAMERA_FROZEN: {
    countsAsWarning: true,
    label: "Camera feed frozen",
    title: "Camera feed looked frozen",
    message:
      "The video stopped changing, which can mean a fake or paused camera feed.",
    guidance: "Use a live camera and avoid virtual backgrounds that freeze.",
  },
  SPEECH_DETECTED: {
    countsAsWarning: true,
    label: "Speech detected",
    title: "Talking was detected",
    message:
      "Sustained speech or another voice was picked up on the microphone.",
    guidance: "Stay quiet during the quiz. Do not talk with anyone nearby.",
  },
}

export function proctorViolationRule(
  kind: ProctorViolationKind
): ProctorViolationRule {
  return RULES[kind]
}

export function isProctorWarning(kind: ProctorViolationKind): boolean {
  return RULES[kind].countsAsWarning
}

export function isProctorViolationKind(
  value: unknown
): value is ProctorViolationKind {
  return (
    typeof value === "string" &&
    (PROCTOR_VIOLATION_KINDS as readonly string[]).includes(value)
  )
}

export function warningsRemaining(
  warningCount: number,
  warningLimit = PROCTOR_WARNING_LIMIT
): number {
  return Math.max(0, warningLimit - warningCount)
}

export function shouldBlankForViolation(kind: ProctorViolationKind): boolean {
  return kind === "SCREEN_CAPTURE_SHORTCUT" || kind === "PRINT_ATTEMPT"
}
