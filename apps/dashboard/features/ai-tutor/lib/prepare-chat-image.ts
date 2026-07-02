const MAX_IMAGE_DIMENSION = 1920
const JPEG_QUALITY = 0.82
const TARGET_MAX_BYTES = 3 * 1024 * 1024

export async function prepareChatImageFile(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) {
    return file
  }

  if (file.size <= TARGET_MAX_BYTES && file.type === "image/jpeg") {
    return file
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(
    1,
    MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height)
  )
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext("2d")
  if (!context) {
    bitmap.close()
    return file
  }

  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
  })

  if (!blob || blob.size > TARGET_MAX_BYTES) {
    return blob ?? file
  }

  return blob
}
