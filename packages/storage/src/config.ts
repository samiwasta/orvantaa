import type { S3ClientConfig } from "@aws-sdk/client-s3"

export type R2Config = {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  publicUrl: string
  endpoint: string
}

export class StorageNotConfiguredError extends Error {
  constructor() {
    super(
      "Cloudflare R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_URL."
    )
    this.name = "StorageNotConfiguredError"
  }
}

export function isR2Configured(): boolean {
  return Boolean(getR2ConfigOrNull())
}

export function getR2ConfigOrNull(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim()
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim()
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim()
  const bucketName = process.env.R2_BUCKET_NAME?.trim()
  const publicUrl = process.env.R2_PUBLIC_URL?.trim()

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    return null
  }

  const endpoint =
    process.env.R2_ENDPOINT?.trim() ||
    `https://${accountId}.r2.cloudflarestorage.com`

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicUrl: publicUrl.replace(/\/$/, ""),
    endpoint,
  }
}

export function getR2Config(): R2Config {
  const config = getR2ConfigOrNull()
  if (!config) throw new StorageNotConfiguredError()
  return config
}

export function getR2ClientConfig(): S3ClientConfig {
  const config = getR2Config()
  return {
    region: "auto",
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  }
}

export function publicUrlForKey(key: string): string {
  const { publicUrl } = getR2Config()
  const normalizedKey = key.replace(/^\//, "")
  return `${publicUrl}/${normalizedKey}`
}
