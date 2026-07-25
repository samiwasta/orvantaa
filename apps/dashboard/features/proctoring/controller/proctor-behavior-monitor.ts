import type { ProctorViolationKind } from "../model/proctor-rules"
import { PROCTOR_BEHAVIOR_WARMUP_MS } from "../model/proctor-rules"
import {
  countFacesInVideo,
  getProctorFaceDetector,
} from "./proctor-face-detector"

const ANALYSIS_WIDTH = 160
const ANALYSIS_HEIGHT = 120
const TICK_MS = 400

const NO_FACE_MS = 3000
const MULTI_FACE_MS = 2000
const OBSTRUCTED_MS = 2000
const FROZEN_MS = 4500
const SPEECH_MS = 2500
/** Minimum gap between client-side emits for the same ongoing condition. */
const REARM_MS = 4500

const DARK_LUMINANCE = 24
const FROZEN_MEAN_DELTA = 2.8
const SPEECH_ABS_RMS = 0.04
const SPEECH_BASELINE_RATIO = 3.8
const CALIBRATION_MS = 1500

export type ProctorBehaviorSignals = {
  ready: boolean
  faceCount: number
  faceTracking: boolean
  luminance: number
  motion: number
  voiceLevel: number
  speaking: boolean
  obstructed: boolean
  frozen: boolean
}

type BehaviorMonitorOptions = {
  stream: MediaStream
  onViolation: (kind: ProctorViolationKind, detail?: string) => void
  onSignals?: (signals: ProctorBehaviorSignals) => void
}

function meanLuminance(data: Uint8ClampedArray): number {
  let total = 0
  const pixels = data.length / 4
  for (let i = 0; i < data.length; i += 4) {
    total += data[i]! * 0.2126 + data[i + 1]! * 0.7152 + data[i + 2]! * 0.0722
  }
  return pixels === 0 ? 0 : total / pixels
}

function meanAbsDelta(
  current: Uint8ClampedArray,
  previous: Uint8ClampedArray | null
): number {
  if (previous?.length !== current.length) return 255

  let total = 0
  const pixels = current.length / 4
  for (let i = 0; i < current.length; i += 4) {
    const c =
      current[i]! * 0.2126 + current[i + 1]! * 0.7152 + current[i + 2]! * 0.0722
    const p =
      previous[i]! * 0.2126 +
      previous[i + 1]! * 0.7152 +
      previous[i + 2]! * 0.0722
    total += Math.abs(c - p)
  }
  return pixels === 0 ? 0 : total / pixels
}

type ConditionTracker = {
  since: number | null
  lastEmitAt: number
}

function createTracker(): ConditionTracker {
  return { since: null, lastEmitAt: 0 }
}

function observeCondition(
  tracker: ConditionTracker,
  active: boolean,
  now: number,
  holdMs: number,
  onFire: () => void
) {
  if (!active) {
    tracker.since = null
    return
  }

  tracker.since ??= now
  if (now - tracker.since >= holdMs && now - tracker.lastEmitAt >= REARM_MS) {
    tracker.lastEmitAt = now
    onFire()
  }
}

/**
 * Continuous voice + video cheating heuristics:
 * - no face / multiple faces (MediaPipe)
 * - covered camera (very dark frames)
 * - frozen / fake feed (near-zero frame motion)
 * - sustained speech on the mic (Web Audio RMS vs ambient baseline)
 */
export function startProctorBehaviorMonitor(
  options: BehaviorMonitorOptions
): () => void {
  const { stream, onViolation, onSignals } = options
  let stopped = false
  let tickTimer: number | null = null
  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let audioSource: MediaStreamAudioSourceNode | null = null

  const video = document.createElement("video")
  video.muted = true
  video.playsInline = true
  video.autoplay = true
  video.srcObject = stream
  void video.play().catch(() => undefined)

  const canvas = document.createElement("canvas")
  canvas.width = ANALYSIS_WIDTH
  canvas.height = ANALYSIS_HEIGHT
  const ctx = canvas.getContext("2d", { willReadFrequently: true })

  const startedAt = performance.now()
  let previousFrame: Uint8ClampedArray | null = null
  let baselineRms = 0
  let baselineSamples = 0
  let faceTracking = false
  let lastFaceCount = 0

  const noFace = createTracker()
  const multiFace = createTracker()
  const obstructedTracker = createTracker()
  const frozenTracker = createTracker()
  const speechTracker = createTracker()

  try {
    audioContext = new AudioContext()
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0.85
    audioSource = audioContext.createMediaStreamSource(stream)
    audioSource.connect(analyser)
    void audioContext.resume().catch(() => undefined)
  } catch {
    audioContext = null
    analyser = null
  }

  const timeDomain = new Float32Array(analyser?.fftSize ?? 2048)

  const readRms = (): number => {
    if (!analyser) return 0
    analyser.getFloatTimeDomainData(timeDomain)
    let sum = 0
    for (let i = 0; i < timeDomain.length; i++) {
      const sample = timeDomain[i] ?? 0
      sum += sample * sample
    }
    return Math.sqrt(sum / timeDomain.length)
  }

  void getProctorFaceDetector().then((detector) => {
    if (!stopped) faceTracking = Boolean(detector)
  })

  const tick = async () => {
    if (stopped || !ctx) return

    const now = performance.now()
    const warmedUp = now - startedAt >= PROCTOR_BEHAVIOR_WARMUP_MS
    const calibrating =
      warmedUp && now - startedAt < PROCTOR_BEHAVIOR_WARMUP_MS + CALIBRATION_MS

    let luminance = 0
    let motion = 0
    let obstructed = false
    let frozen = false

    if (video.readyState >= 2 && video.videoWidth > 0) {
      ctx.drawImage(video, 0, 0, ANALYSIS_WIDTH, ANALYSIS_HEIGHT)
      const frame = ctx.getImageData(0, 0, ANALYSIS_WIDTH, ANALYSIS_HEIGHT)
      luminance = meanLuminance(frame.data)
      motion = meanAbsDelta(frame.data, previousFrame)
      previousFrame = new Uint8ClampedArray(frame.data)

      obstructed = luminance < DARK_LUMINANCE
      frozen = !obstructed && motion < FROZEN_MEAN_DELTA
    }

    const rms = readRms()
    if (calibrating) {
      baselineRms =
        (baselineRms * baselineSamples + rms) / (baselineSamples + 1)
      baselineSamples += 1
    }

    const speechThreshold = Math.max(
      SPEECH_ABS_RMS,
      baselineRms * SPEECH_BASELINE_RATIO
    )
    const speaking = warmedUp && !calibrating && rms >= speechThreshold

    const detector = faceTracking ? await getProctorFaceDetector() : null
    if (detector && video.readyState >= 2) {
      lastFaceCount = countFacesInVideo(detector, video, now)
    }

    if (warmedUp && !calibrating) {
      observeCondition(obstructedTracker, obstructed, now, OBSTRUCTED_MS, () =>
        onViolation("CAMERA_OBSTRUCTED", `luminance:${luminance.toFixed(1)}`)
      )

      observeCondition(frozenTracker, frozen, now, FROZEN_MS, () =>
        onViolation("CAMERA_FROZEN", `motion:${motion.toFixed(2)}`)
      )

      observeCondition(speechTracker, speaking, now, SPEECH_MS, () =>
        onViolation("SPEECH_DETECTED", `rms:${rms.toFixed(3)}`)
      )

      if (faceTracking) {
        observeCondition(
          noFace,
          lastFaceCount === 0 && !obstructed,
          now,
          NO_FACE_MS,
          () => onViolation("NO_FACE_DETECTED")
        )
        observeCondition(
          multiFace,
          lastFaceCount >= 2,
          now,
          MULTI_FACE_MS,
          () => onViolation("MULTIPLE_FACES", `faces:${lastFaceCount}`)
        )
      }
    }

    onSignals?.({
      ready: warmedUp,
      faceCount: lastFaceCount,
      faceTracking,
      luminance,
      motion,
      voiceLevel: Math.min(1, rms / Math.max(speechThreshold, 0.01)),
      speaking,
      obstructed,
      frozen,
    })
  }

  const schedule = () => {
    void tick().finally(() => {
      if (stopped) return
      tickTimer = window.setTimeout(schedule, TICK_MS)
    })
  }

  schedule()

  return () => {
    stopped = true
    if (tickTimer !== null) window.clearTimeout(tickTimer)
    video.pause()
    video.srcObject = null
    audioSource?.disconnect()
    analyser?.disconnect()
    void audioContext?.close().catch(() => undefined)
  }
}
