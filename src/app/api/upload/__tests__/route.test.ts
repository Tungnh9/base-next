// jsdom's File/FormData/Request implementations don't round-trip binary bytes
// the way NextRequest (built on undici) expects — run this file against the
// real Node globals instead, same rationale as src/lib/__tests__/auth.test.ts.
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

// vi.mock calls are hoisted — run before any import
vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(),
}))

vi.mock("fs/promises", () => {
  const writeFile = vi.fn()
  const mkdir = vi.fn()
  return { writeFile, mkdir, default: { writeFile, mkdir } }
})

import { POST } from "../route"
import { getSession } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"

const mockGetSession = vi.mocked(getSession)
const mockWriteFile = vi.mocked(writeFile)
const mockMkdir = vi.mocked(mkdir)

const mockSession = { userId: "1", email: "user@example.com", role: "user" }

// Real PNG signature — first 4 bytes checked by hasSafeImageMagicBytes()
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

function pngFile(name = "photo.png", extraBytes = 16): File {
  const bytes = new Uint8Array([...PNG_MAGIC, ...new Array(extraBytes).fill(0)])
  return new File([bytes], name, { type: "image/png" })
}

function makeUploadRequest(formData: FormData): NextRequest {
  return new NextRequest("http://localhost/api/upload", {
    method: "POST",
    body: formData,
  })
}

describe("POST /api/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSession.mockResolvedValue(mockSession as never)
  })

  it("returns 401 and never touches the filesystem when there is no session", async () => {
    mockGetSession.mockResolvedValue(null)
    const fd = new FormData()
    fd.set("file", pngFile())

    const res = await POST(makeUploadRequest(fd))

    expect(res.status).toBe(401)
    expect(mockWriteFile).not.toHaveBeenCalled()
  })

  it("returns 501 in production, before any file parsing occurs", async () => {
    vi.stubEnv("NODE_ENV", "production")
    try {
      // Empty body — if the route tried to parse this as form data before the
      // production check, it would throw instead of returning 501 cleanly.
      const res = await POST(makeUploadRequest(new FormData()))

      expect(res.status).toBe(501)
      expect(mockWriteFile).not.toHaveBeenCalled()
    } finally {
      vi.unstubAllEnvs()
    }
  })

  it("returns 400 when the form value is not a File", async () => {
    const fd = new FormData()
    fd.set("file", "not-a-file")

    const res = await POST(makeUploadRequest(fd))

    expect(res.status).toBe(400)
    expect(mockWriteFile).not.toHaveBeenCalled()
  })

  it("returns 400 for a disallowed MIME type (e.g. SVG)", async () => {
    const fd = new FormData()
    fd.set("file", new File(["<svg></svg>"], "image.svg", { type: "image/svg+xml" }))

    const res = await POST(makeUploadRequest(fd))

    expect(res.status).toBe(400)
    expect(mockWriteFile).not.toHaveBeenCalled()
  })

  it("returns 400 for an oversized file (>5MB)", async () => {
    const bigBytes = new Uint8Array(5 * 1024 * 1024 + 1)
    const fd = new FormData()
    fd.set("file", new File([bigBytes], "big.png", { type: "image/png" }))

    const res = await POST(makeUploadRequest(fd))

    expect(res.status).toBe(400)
    expect(mockWriteFile).not.toHaveBeenCalled()
  })

  it("returns 400 when the file content doesn't match its declared MIME type", async () => {
    const fd = new FormData()
    // Declares image/png but the bytes don't carry the PNG signature
    fd.set(
      "file",
      new File([new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])], "fake.png", {
        type: "image/png",
      })
    )

    const res = await POST(makeUploadRequest(fd))

    expect(res.status).toBe(400)
    expect(mockWriteFile).not.toHaveBeenCalled()
  })

  it("returns 200 with a URL for a valid PNG upload", async () => {
    mockMkdir.mockResolvedValue(undefined)
    mockWriteFile.mockResolvedValue(undefined)

    const fd = new FormData()
    fd.set("file", pngFile("avatar.png"))

    const res = await POST(makeUploadRequest(fd))
    const body = (await res.json()) as { url?: string }

    expect(res.status).toBe(200)
    expect(body.url).toMatch(/^\/uploads\/\d+-avatar\.png$/)
    expect(mockMkdir).toHaveBeenCalledOnce()
    expect(mockWriteFile).toHaveBeenCalledOnce()
  })
})
