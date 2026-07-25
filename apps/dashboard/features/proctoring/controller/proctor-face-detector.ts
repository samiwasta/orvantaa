import type { FaceDetector } from "@mediapipe/tasks-vision"

const MEDIAPIPE_VERSION = "0.10.21"
const WASM_CDN = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`
const FACE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite"

let detectorPromise: Promise<FaceDetector | null> | null = null

/**
 * Lazily loads MediaPipe Face Detector in the browser. Returns null when the
 * model cannot load so heuristics can still run without crashing the quiz.
 */
export async function getProctorFaceDetector(): Promise<FaceDetector | null> {
  if (typeof window === "undefined") return null
  if (detectorPromise) return detectorPromise

  detectorPromise = (async () => {
    try {
      const vision = await import("@mediapipe/tasks-vision")
      const fileset = await vision.FilesetResolver.forVisionTasks(WASM_CDN)
      return await vision.FaceDetector.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: FACE_MODEL_URL,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        minDetectionConfidence: 0.55,
        minSuppressionThreshold: 0.3,
      })
    } catch {
      try {
        const vision = await import("@mediapipe/tasks-vision")
        const fileset = await vision.FilesetResolver.forVisionTasks(WASM_CDN)
        return await vision.FaceDetector.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: FACE_MODEL_URL,
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          minDetectionConfidence: 0.55,
          minSuppressionThreshold: 0.3,
        })
      } catch {
        detectorPromise = null
        return null
      }
    }
  })()

  return detectorPromise
}

export function countFacesInVideo(
  detector: FaceDetector,
  video: HTMLVideoElement,
  timestampMs: number
): number {
  if (video.readyState < 2 || video.videoWidth === 0) return 0

  try {
    const result = detector.detectForVideo(video, timestampMs)
    return result.detections?.length ?? 0
  } catch {
    return 0
  }
}
