import { randomUUID } from "crypto"
import { mkdir, writeFile } from "fs/promises"
import path from "path"

import { NextResponse } from "next/server"

import { requireAdminSession } from "@/lib/auth/session"

const MAX_BYTES = 2 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
])

export async function POST(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ message: "No file provided." }, { status: 400 })
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { message: "Use a JPEG, PNG, WebP, or GIF image." },
      { status: 400 }
    )
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { message: "Image must be 2 MB or smaller." },
      { status: 400 }
    )
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : file.type === "image/gif"
          ? "gif"
          : "jpg"

  const fileName = `${randomUUID()}.${ext}`
  const uploadDir = path.join(process.cwd(), "public", "subject-thumbnails")
  await mkdir(uploadDir, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(uploadDir, fileName), buffer)

  return NextResponse.json({ url: `/subject-thumbnails/${fileName}` })
}
