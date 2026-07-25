"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  isProctorWarning,
  PROCTOR_BLANK_SCREEN_MS,
  PROCTOR_WARNING_COOLDOWN_MS,
  PROCTOR_WARNING_LIMIT,
  type ProctorViolationKind,
  shouldBlankForViolation,
} from "../model/proctor-rules"
import type {
  ProctorLockState,
  ProctorSessionState,
  ProctorViolationResult,
} from "../model/proctor-session"
import {
  endProctorSession,
  reportProctorViolation,
  startProctorSession,
} from "../service/proctor-client.service"
import {
  type ProctorBehaviorSignals,
  startProctorBehaviorMonitor,
} from "./proctor-behavior-monitor"
import { attachProctorMediaGuards, requestProctorMedia } from "./proctor-media"

const NOTICE_DURATION_MS = 2800

export type ProctorStatus =
  | "idle"
  | "starting"
  | "active"
  | "ended"
  | "terminated"
  | "locked"
  | "error"

export type ProctorWarning = {
  kind: ProctorViolationKind
  warningNumber: number
  warningLimit: number
}

export type ProctorNotice = {
  id: number
  kind: ProctorViolationKind
}

type UseQuizProctorOptions = {
  quizId: string
  questionIndex: number
  onTerminated: (session: ProctorSessionState) => void
}

async function enterFullscreen(): Promise<boolean> {
  const target = document.documentElement
  if (typeof target.requestFullscreen !== "function") return false
  if (document.fullscreenElement) return true

  try {
    await target.requestFullscreen({ navigationUI: "hide" })
    return true
  } catch {
    return false
  }
}

async function leaveFullscreen(): Promise<void> {
  if (!document.fullscreenElement) return
  if (typeof document.exitFullscreen !== "function") return

  try {
    await document.exitFullscreen()
  } catch {
    // Nothing else to do, the attempt is already finishing.
  }
}

function isScreenCaptureShortcut(event: KeyboardEvent): boolean {
  const key = event.key.toLowerCase()
  if (key === "printscreen") return true

  const modifier = event.metaKey || event.ctrlKey
  if (event.metaKey && event.shiftKey && ["3", "4", "5"].includes(key)) {
    return true
  }
  // Windows Snipping Tool / common capture chords
  if (modifier && event.shiftKey && key === "s") return true

  return false
}

export function useQuizProctor({
  quizId,
  questionIndex,
  onTerminated,
}: UseQuizProctorOptions) {
  const [status, setStatus] = useState<ProctorStatus>("idle")
  const [suspended, setSuspended] = useState(false)
  const [session, setSession] = useState<ProctorSessionState | null>(null)
  const [warning, setWarning] = useState<ProctorWarning | null>(null)
  const [notice, setNotice] = useState<ProctorNotice | null>(null)
  const [lock, setLock] = useState<ProctorLockState | null>(null)
  const [startError, setStartError] = useState<string | null>(null)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  const [blankScreen, setBlankScreen] = useState(false)
  const [behaviorSignals, setBehaviorSignals] =
    useState<ProctorBehaviorSignals | null>(null)

  const sessionIdRef = useRef<string | null>(null)
  const warningOpenRef = useRef(false)
  const lastWarningAtRef = useRef(0)
  const localWarningCountRef = useRef(0)
  const fullscreenRef = useRef(false)
  const monitoringRef = useRef(false)
  const monitoringStartedAtRef = useRef(0)
  const closedRef = useRef(false)
  const questionIndexRef = useRef(questionIndex)
  const onTerminatedRef = useRef(onTerminated)
  const mediaStopRef = useRef<(() => void) | null>(null)
  const mediaGuardStopRef = useRef<(() => void) | null>(null)
  const behaviorStopRef = useRef<(() => void) | null>(null)
  const blankTimerRef = useRef<number | null>(null)
  const warningLimitRef = useRef(PROCTOR_WARNING_LIMIT)

  questionIndexRef.current = questionIndex
  onTerminatedRef.current = onTerminated

  const monitoring = status === "active" && !suspended
  monitoringRef.current = monitoring

  const stopMedia = useCallback(() => {
    behaviorStopRef.current?.()
    behaviorStopRef.current = null
    mediaGuardStopRef.current?.()
    mediaGuardStopRef.current = null
    mediaStopRef.current?.()
    mediaStopRef.current = null
    setMediaStream(null)
    setBehaviorSignals(null)
  }, [])

  const clearBlankTimer = useCallback(() => {
    if (blankTimerRef.current !== null) {
      window.clearTimeout(blankTimerRef.current)
      blankTimerRef.current = null
    }
  }, [])

  const flashBlankScreen = useCallback(() => {
    setBlankScreen(true)
    // Force a synchronous paint so OS capture often lands on the blank frame.
    void document.body?.offsetHeight
    clearBlankTimer()
    blankTimerRef.current = window.setTimeout(() => {
      setBlankScreen(false)
      blankTimerRef.current = null
    }, PROCTOR_BLANK_SCREEN_MS)
  }, [clearBlankTimer])

  const applyViolation = useCallback(
    (result: ProctorViolationResult) => {
      setSession(result.session)
      warningLimitRef.current = result.session.warningLimit
      if (result.session.warningCount > localWarningCountRef.current) {
        localWarningCountRef.current = result.session.warningCount
      }

      if (shouldBlankForViolation(result.kind)) {
        flashBlankScreen()
      }

      if (result.terminated) {
        closedRef.current = true
        warningOpenRef.current = false
        setWarning(null)
        setNotice(null)
        setStatus("terminated")
        stopMedia()
        void leaveFullscreen()
        onTerminatedRef.current(result.session)
        return
      }

      if (result.counted && result.warningNumber !== null) {
        warningOpenRef.current = true
        setWarning({
          kind: result.kind,
          warningNumber: result.warningNumber,
          warningLimit: result.session.warningLimit,
        })
        return
      }

      if (!isProctorWarning(result.kind)) {
        setNotice({ id: Date.now(), kind: result.kind })
      }
    },
    [flashBlankScreen, stopMedia]
  )

  const applyLocalWarning = useCallback(
    (kind: ProctorViolationKind) => {
      const warningLimit = warningLimitRef.current || PROCTOR_WARNING_LIMIT
      localWarningCountRef.current += 1
      const warningNumber = localWarningCountRef.current

      setSession((prev) =>
        prev ? { ...prev, warningCount: warningNumber, warningLimit } : prev
      )

      if (warningNumber >= warningLimit) {
        closedRef.current = true
        warningOpenRef.current = false
        setWarning(null)
        setNotice(null)
        setStatus("terminated")
        stopMedia()
        void leaveFullscreen()
        onTerminatedRef.current({
          id: sessionIdRef.current ?? "",
          quizId,
          status: "TERMINATED",
          warningCount: warningNumber,
          warningLimit,
          resumed: false,
        })
        return
      }

      warningOpenRef.current = true
      setWarning({
        kind,
        warningNumber,
        warningLimit,
      })
    },
    [quizId, stopMedia]
  )

  const report = useCallback(
    async (kind: ProctorViolationKind, detail?: string) => {
      const sessionId = sessionIdRef.current
      if (!sessionId || !monitoringRef.current || warningOpenRef.current) return
      if (closedRef.current) return

      // Ignore focus noise right after the attempt arms (fullscreen settle).
      if (
        (kind === "WINDOW_BLUR" || kind === "FULLSCREEN_EXIT") &&
        monitoringStartedAtRef.current > 0 &&
        Date.now() - monitoringStartedAtRef.current < 2500
      ) {
        return
      }

      if (shouldBlankForViolation(kind)) {
        flashBlankScreen()
      }

      if (isProctorWarning(kind)) {
        const now = Date.now()
        if (now - lastWarningAtRef.current < PROCTOR_WARNING_COOLDOWN_MS) return
        lastWarningAtRef.current = now

        // Show the warning immediately so a slow/failed API cannot hide it.
        applyLocalWarning(kind)
      }

      try {
        const result = await reportProctorViolation(sessionId, {
          kind,
          questionIndex: questionIndexRef.current,
          detail,
        })

        // Prefer server truth when it arrives; keep the dialog already open.
        setSession(result.session)
        warningLimitRef.current = result.session.warningLimit
        if (result.session.warningCount > localWarningCountRef.current) {
          localWarningCountRef.current = result.session.warningCount
        }

        if (result.terminated) {
          closedRef.current = true
          warningOpenRef.current = false
          setWarning(null)
          setNotice(null)
          setStatus("terminated")
          stopMedia()
          void leaveFullscreen()
          onTerminatedRef.current(result.session)
          return
        }

        if (
          result.counted &&
          result.warningNumber !== null &&
          warningOpenRef.current
        ) {
          setWarning({
            kind: result.kind,
            warningNumber: result.warningNumber,
            warningLimit: result.session.warningLimit,
          })
        }

        if (!isProctorWarning(result.kind) && !result.counted) {
          setNotice({ id: Date.now(), kind: result.kind })
        }
      } catch (error) {
        console.error("[proctor] Failed to record violation:", kind, error)
      }
    },
    [applyLocalWarning, flashBlankScreen, stopMedia]
  )

  const reportRef = useRef(report)
  reportRef.current = report

  const start = useCallback(async (): Promise<boolean> => {
    if (status === "starting" || status === "active") return false

    setStatus("starting")
    setStartError(null)
    setLock(null)
    setBlankScreen(false)

    try {
      const acquiredMedia = await requestProctorMedia()
      mediaStopRef.current = acquiredMedia.stop
      setMediaStream(acquiredMedia.stream)

      fullscreenRef.current = await enterFullscreen()

      const result = await startProctorSession(quizId)

      if (result.lock) {
        setLock(result.lock)
        setStatus("locked")
        stopMedia()
        void leaveFullscreen()
        return false
      }
      if (!result.session) {
        throw new Error("Could not start the proctored attempt.")
      }

      sessionIdRef.current = result.session.id
      closedRef.current = false
      lastWarningAtRef.current = 0
      localWarningCountRef.current = result.session.warningCount
      warningLimitRef.current =
        result.session.warningLimit || PROCTOR_WARNING_LIMIT
      warningOpenRef.current = false
      setSession(result.session)

      if (result.session.status === "TERMINATED") {
        closedRef.current = true
        setStatus("terminated")
        stopMedia()
        void leaveFullscreen()
        onTerminatedRef.current(result.session)
        return false
      }

      setStatus("active")
      setSuspended(false)
      monitoringRef.current = true
      monitoringStartedAtRef.current = Date.now()

      mediaGuardStopRef.current = attachProctorMediaGuards(
        acquiredMedia.stream,
        () => void reportRef.current("CAMERA_DISABLED"),
        () => void reportRef.current("MIC_DISABLED")
      )

      behaviorStopRef.current = startProctorBehaviorMonitor({
        stream: acquiredMedia.stream,
        onViolation: (kind, detail) => {
          void reportRef.current(kind, detail)
        },
        onSignals: setBehaviorSignals,
      })

      if (result.resumeWarning?.counted) {
        applyViolation(result.resumeWarning)
      }

      return true
    } catch (error) {
      stopMedia()
      setStatus("error")
      setStartError(
        error instanceof Error
          ? error.message
          : "Could not start the proctored attempt."
      )
      void leaveFullscreen()
      return false
    }
  }, [applyViolation, quizId, status, stopMedia])

  const acknowledgeWarning = useCallback(() => {
    warningOpenRef.current = false
    lastWarningAtRef.current = Date.now()
    setWarning(null)

    if (fullscreenRef.current && !document.fullscreenElement) {
      void enterFullscreen()
    }
  }, [])

  const suspend = useCallback(() => setSuspended(true), [])
  const resume = useCallback(() => setSuspended(false), [])

  const complete = useCallback(() => {
    closedRef.current = true
    setStatus("ended")
    clearBlankTimer()
    setBlankScreen(false)
    stopMedia()
    void leaveFullscreen()
  }, [clearBlankTimer, stopMedia])

  const abandon = useCallback(() => {
    const sessionId = sessionIdRef.current
    setStatus("ended")
    clearBlankTimer()
    setBlankScreen(false)
    stopMedia()
    void leaveFullscreen()

    if (!sessionId || closedRef.current) return
    closedRef.current = true
    void endProctorSession(sessionId, "ABANDONED")
  }, [clearBlankTimer, stopMedia])

  useEffect(() => {
    if (!notice) return

    const timer = window.setTimeout(() => setNotice(null), NOTICE_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    if (!monitoring) return

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flashBlankScreen()
        void report("TAB_HIDDEN")
      }
    }
    const onWindowBlur = () => void report("WINDOW_BLUR")
    const onFullscreenChange = () => {
      if (fullscreenRef.current && !document.fullscreenElement) {
        void report("FULLSCREEN_EXIT")
      }
    }
    const onCopy = (event: Event) => {
      event.preventDefault()
      void report("COPY_ATTEMPT")
    }
    const onPaste = (event: Event) => {
      event.preventDefault()
      void report("PASTE_ATTEMPT")
    }
    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault()
      void report("CONTEXT_MENU")
    }
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const modifier = event.ctrlKey || event.metaKey

      const devtools =
        key === "f12" ||
        (modifier && event.shiftKey && ["i", "j", "c"].includes(key)) ||
        (event.ctrlKey && !event.shiftKey && key === "u")

      if (devtools) {
        event.preventDefault()
        void report("DEVTOOLS_SHORTCUT", `key:${event.key}`)
        return
      }

      if (modifier && key === "p") {
        event.preventDefault()
        flashBlankScreen()
        void report("PRINT_ATTEMPT")
        return
      }

      if (isScreenCaptureShortcut(event)) {
        event.preventDefault()
        flashBlankScreen()
        void report("SCREEN_CAPTURE_SHORTCUT", `key:${event.key}`)
      }
    }
    const onKeyUp = (event: KeyboardEvent) => {
      // PrintScreen often fires on keyup in some browsers.
      if (event.key.toLowerCase() === "printscreen") {
        flashBlankScreen()
        void report("SCREEN_CAPTURE_SHORTCUT", "keyup:printscreen")
      }
    }
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    const onBeforePrint = () => {
      flashBlankScreen()
      void report("PRINT_ATTEMPT")
    }

    document.addEventListener("visibilitychange", onVisibilityChange)
    document.addEventListener("fullscreenchange", onFullscreenChange)
    document.addEventListener("copy", onCopy)
    document.addEventListener("cut", onCopy)
    document.addEventListener("paste", onPaste)
    document.addEventListener("contextmenu", onContextMenu)
    window.addEventListener("blur", onWindowBlur)
    window.addEventListener("keydown", onKeyDown, true)
    window.addEventListener("keyup", onKeyUp, true)
    window.addEventListener("beforeunload", onBeforeUnload)
    window.addEventListener("beforeprint", onBeforePrint)

    document.documentElement.classList.add("proctor-secure")

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange)
      document.removeEventListener("fullscreenchange", onFullscreenChange)
      document.removeEventListener("copy", onCopy)
      document.removeEventListener("cut", onCopy)
      document.removeEventListener("paste", onPaste)
      document.removeEventListener("contextmenu", onContextMenu)
      window.removeEventListener("blur", onWindowBlur)
      window.removeEventListener("keydown", onKeyDown, true)
      window.removeEventListener("keyup", onKeyUp, true)
      window.removeEventListener("beforeunload", onBeforeUnload)
      window.removeEventListener("beforeprint", onBeforePrint)
      document.documentElement.classList.remove("proctor-secure")
    }
  }, [flashBlankScreen, monitoring, report])

  useEffect(
    () => () => {
      clearBlankTimer()
      stopMedia()
      document.documentElement.classList.remove("proctor-secure")
      const sessionId = sessionIdRef.current
      if (!sessionId || closedRef.current) return
      closedRef.current = true
      void endProctorSession(sessionId, "ABANDONED")
      void leaveFullscreen()
    },
    [clearBlankTimer, stopMedia]
  )

  return {
    status,
    sessionId: session?.id ?? null,
    warningCount: session?.warningCount ?? 0,
    warningLimit: session?.warningLimit ?? 0,
    warning,
    notice,
    lock,
    startError,
    mediaStream,
    blankScreen,
    behaviorSignals,
    isStarting: status === "starting",
    isMonitoring: monitoring,
    fullscreenEnforced: fullscreenRef.current,
    start,
    acknowledgeWarning,
    suspend,
    resume,
    complete,
    abandon,
  }
}
