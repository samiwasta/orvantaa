export type ProctorMediaStream = {
  stream: MediaStream
  stop: () => void
}

function stopStream(stream: MediaStream | null) {
  if (!stream) return
  for (const track of stream.getTracks()) {
    track.stop()
  }
}

export async function requestProctorMedia(): Promise<ProctorMediaStream> {
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    throw new Error(
      "Camera and microphone are required for this proctored quiz, but this browser does not support them."
    )
  }

  let stream: MediaStream
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
    })
  } catch (error) {
    const name = error instanceof DOMException ? error.name : ""
    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
      throw new Error(
        "Camera and microphone permission is required. Allow both, then start again."
      )
    }
    if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      throw new Error(
        "No camera or microphone was found. Connect both devices, then start again."
      )
    }
    throw new Error(
      "Could not open the camera and microphone. Check device permissions and try again."
    )
  }

  const videoTracks = stream.getVideoTracks()
  const audioTracks = stream.getAudioTracks()
  if (videoTracks.length === 0 || audioTracks.length === 0) {
    stopStream(stream)
    throw new Error(
      "Camera and microphone are both required. Enable both devices, then start again."
    )
  }

  return {
    stream,
    stop: () => stopStream(stream),
  }
}

export function attachProctorMediaGuards(
  stream: MediaStream,
  onCameraLost: () => void,
  onMicLost: () => void
): () => void {
  const videoTrack = stream.getVideoTracks()[0]
  const audioTrack = stream.getAudioTracks()[0]
  let cameraReported = false
  let micReported = false

  const reportCamera = () => {
    if (cameraReported) return
    cameraReported = true
    onCameraLost()
  }

  const reportMic = () => {
    if (micReported) return
    micReported = true
    onMicLost()
  }

  const onVideoEnded = () => reportCamera()
  const onAudioEnded = () => reportMic()

  videoTrack?.addEventListener("ended", onVideoEnded)
  audioTrack?.addEventListener("ended", onAudioEnded)

  const poll = window.setInterval(() => {
    if (videoTrack?.readyState !== "live" || !videoTrack.enabled) {
      reportCamera()
    }
    if (audioTrack?.readyState !== "live" || !audioTrack.enabled) {
      reportMic()
    }
  }, 1500)

  return () => {
    window.clearInterval(poll)
    videoTrack?.removeEventListener("ended", onVideoEnded)
    audioTrack?.removeEventListener("ended", onAudioEnded)
  }
}
