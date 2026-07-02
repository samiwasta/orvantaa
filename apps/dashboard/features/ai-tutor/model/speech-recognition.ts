type SpeechRecognitionResultItem = {
  transcript: string
}

type SpeechRecognitionResult = {
  isFinal: boolean
  length: number
  [index: number]: SpeechRecognitionResultItem
}

export type BrowserSpeechRecognitionEvent = Event & {
  resultIndex: number
  results: {
    length: number
    [index: number]: SpeechRecognitionResult
  }
}

export type BrowserSpeechRecognitionErrorEvent = Event & {
  error: string
}

export type BrowserSpeechRecognition = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: new () => BrowserSpeechRecognition
  webkitSpeechRecognition?: new () => BrowserSpeechRecognition
}

export function getSpeechRecognitionCtor():
  | (new () => BrowserSpeechRecognition)
  | null {
  if (typeof window === "undefined") return null

  const speechWindow = window as SpeechRecognitionWindow
  return (
    speechWindow.SpeechRecognition ??
    speechWindow.webkitSpeechRecognition ??
    null
  )
}

export function joinDictationText(left: string, right: string): string {
  const trimmedLeft = left.trimEnd()
  const trimmedRight = right.trimStart()
  if (!trimmedLeft) return trimmedRight
  if (!trimmedRight) return trimmedLeft
  return `${trimmedLeft} ${trimmedRight}`
}
