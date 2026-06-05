import { NextResponse } from "next/server"

import { requireAdminSession } from "@/lib/auth/session"
import {
  extensionForImageContentType,
  isR2Configured,
  StorageNotConfiguredError,
  uploadToR2,
  validateImageUpload,
} from "@workspace/storage"

const NOTE_IMAGE_PREFIX = "note-images"

export async function POST(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 })
  }

  if (!isR2Configured()) {
    return NextResponse.json(
      {
        message:
          "File storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_URL.",
      },
      { status: 503 }
    )
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ message: "No file provided." }, { status: 400 })
  }

  const validationError = validateImageUpload(file)
  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 })
  }

  const extension = extensionForImageContentType(file.type)
  if (!extension) {
    return NextResponse.json(
      { message: "Use a JPEG, PNG, WebP, or GIF image." },
      { status: 400 }
    )
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const { url } = await uploadToR2({
      prefix: NOTE_IMAGE_PREFIX,
      body: buffer,
      contentType: file.type,
      extension,
    })

    return NextResponse.json({ url })
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return NextResponse.json({ message: error.message }, { status: 503 })
    }
    console.error("[uploads/note-image]", error)
    return NextResponse.json(
      { message: "Could not upload the image. Please try again." },
      { status: 500 }
    )
  }
}
