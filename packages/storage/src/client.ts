import { S3Client } from "@aws-sdk/client-s3"

import { getR2ClientConfig } from "./config"

let client: S3Client | null = null

export function getR2Client(): S3Client {
  if (!client) {
    client = new S3Client(getR2ClientConfig())
  }
  return client
}
