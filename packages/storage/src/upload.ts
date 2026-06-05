import { PutObjectCommand } from "@aws-sdk/client-s3"
import { randomUUID } from "crypto"

import { getR2Client } from "./client"
import { getR2Config, publicUrlForKey } from "./config"

export const IMAGE_UPLOAD_MAX_BYTES = 2 * 1024 * 1024

export const IMAGE_UPLOAD_ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
])

export function extensionForImageContentType(contentType: string): string | null {
  switch (contentType) {
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    case "image/gif":
      return "gif"
    case "image/jpeg":
      return "jpg"
    default:
      return null
  }
}

export function validateImageUpload(file: {
  type: string
  size: number
}): string | null {
  if (!IMAGE_UPLOAD_ALLOWED_TYPES.has(file.type)) {
    return "Use a JPEG, PNG, WebP, or GIF image."
  }
  if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
    return "Image must be 2 MB or smaller."
  }
  return null
}

export async function uploadToR2(params: {
  prefix: string
  body: Buffer
  contentType: string
  extension: string
}): Promise<{ key: string; url: string }> {
  const { bucketName } = getR2Config()
  const normalizedPrefix = params.prefix.replace(/^\/+|\/+$/g, "")
  const key = `${normalizedPrefix}/${randomUUID()}.${params.extension}`

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: params.body,
      ContentType: params.contentType,
    })
  )

  return { key, url: publicUrlForKey(key) }
}
