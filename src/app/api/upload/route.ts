import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { getSession } from "@/lib/auth"

// Explicit whitelist — SVG intentionally excluded (stored-XSS risk via scripted SVG)
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
])

function hasSafeImageMagicBytes(buf: Buffer, mimeType: string): boolean {
  if (mimeType === "image/jpeg") return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
  if (mimeType === "image/png")
    return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47
  if (mimeType === "image/gif")
    return buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38
  if (mimeType === "image/webp")
    return (
      buf.length >= 12 &&
      buf.subarray(0, 4).toString() === "RIFF" &&
      buf.subarray(8, 12).toString() === "WEBP"
    )
  if (mimeType === "image/avif") return buf.length >= 8 && buf.subarray(4, 8).toString() === "ftyp"
  return false
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // This route writes to the local filesystem — only available in development.
  // Production deployments must wire up cloud storage (S3, R2, etc.) via the backend.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "File upload requires backend storage configuration" },
      { status: 501 }
    )
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, GIF, WebP, and AVIF images are allowed" },
      { status: 400 }
    )
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  if (!hasSafeImageMagicBytes(buffer, file.type)) {
    return NextResponse.json(
      { error: "File content does not match declared type" },
      { status: 400 }
    )
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_") || "upload"
  const filename = `${Date.now()}-${safeName}`
  const uploadDir = path.join(process.cwd(), "public", "uploads")

  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, filename), buffer)

  return NextResponse.json({ url: `/uploads/${filename}` })
}
