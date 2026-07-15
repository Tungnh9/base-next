import { describe, it, expect } from "vitest"
import { parseVideoUrl, isAllowedVideoEmbedSrc } from "../video/parse-video-url"

describe("parseVideoUrl", () => {
  it("parses a YouTube watch?v= URL", () => {
    expect(parseVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toEqual({
      provider: "youtube",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    })
  })

  it("parses a youtu.be short URL", () => {
    expect(parseVideoUrl("https://youtu.be/dQw4w9WgXcQ")).toEqual({
      provider: "youtube",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    })
  })

  it("parses a /shorts/ URL", () => {
    expect(parseVideoUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toEqual({
      provider: "youtube",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    })
  })

  it("parses an already-embed URL", () => {
    expect(parseVideoUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toEqual({
      provider: "youtube",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    })
  })

  it("parses a vimeo.com/<id> URL", () => {
    expect(parseVideoUrl("https://vimeo.com/123456789")).toEqual({
      provider: "vimeo",
      embedUrl: "https://player.vimeo.com/video/123456789",
    })
  })

  it("parses a vimeo.com/video/<id> URL", () => {
    expect(parseVideoUrl("https://vimeo.com/video/123456789")).toEqual({
      provider: "vimeo",
      embedUrl: "https://player.vimeo.com/video/123456789",
    })
  })

  it.each(["mp4", "webm", "ogg", "mov"])("parses a direct .%s file URL", (ext) => {
    const url = `https://cdn.example.com/clip.${ext}`
    expect(parseVideoUrl(url)).toEqual({ provider: "file", embedUrl: url })
  })

  it("parses a direct file URL with a querystring", () => {
    const url = "https://cdn.example.com/clip.mp4?token=abc"
    expect(parseVideoUrl(url)).toEqual({ provider: "file", embedUrl: url })
  })

  it("parses a blob: URL as a file", () => {
    const url = "blob:https://app.example.com/12345"
    expect(parseVideoUrl(url)).toEqual({ provider: "file", embedUrl: url })
  })

  it("returns null for an empty or whitespace-only string", () => {
    expect(parseVideoUrl("")).toBeNull()
    expect(parseVideoUrl("   ")).toBeNull()
  })

  it("returns null for an unrecognized URL", () => {
    expect(parseVideoUrl("https://example.com/not-a-video")).toBeNull()
  })
})

describe("isAllowedVideoEmbedSrc — security allowlist", () => {
  it("allows a blob: src for the file provider", () => {
    expect(isAllowedVideoEmbedSrc("blob:https://app.example.com/xyz", "file")).toBe(true)
  })

  it("allows any https host for the file provider as long as it's a video file extension", () => {
    // Documents the current trust model: file-provider matching is content-based
    // (extension/blob), not host-based, unlike the iframe-embed providers below.
    expect(isAllowedVideoEmbedSrc("https://evil.com/x.mp4", "file")).toBe(true)
  })

  it("rejects a non-video-file https URL for the file provider", () => {
    expect(isAllowedVideoEmbedSrc("https://evil.com/x.html", "file")).toBe(false)
  })

  it("allows an https youtube.com embed URL", () => {
    expect(isAllowedVideoEmbedSrc("https://www.youtube.com/embed/xyz", "youtube")).toBe(true)
  })

  it("allows an https player.vimeo.com embed URL", () => {
    expect(isAllowedVideoEmbedSrc("https://player.vimeo.com/video/1", "vimeo")).toBe(true)
  })

  it("rejects a non-https (plain http) youtube embed URL", () => {
    expect(isAllowedVideoEmbedSrc("http://www.youtube.com/embed/xyz", "youtube")).toBe(false)
  })

  it("rejects a hostname-suffix spoofing attempt (youtube.com.evil.com)", () => {
    expect(isAllowedVideoEmbedSrc("https://www.youtube.com.evil.com/embed/xyz", "youtube")).toBe(
      false
    )
  })

  it("rejects a URL that merely contains the allowed host as a query param", () => {
    expect(isAllowedVideoEmbedSrc("https://evil.com/?u=https://www.youtube.com", "youtube")).toBe(
      false
    )
  })

  it("rejects a javascript: scheme", () => {
    expect(isAllowedVideoEmbedSrc("javascript:alert(1)", "youtube")).toBe(false)
  })

  it("rejects a host not on the allowlist", () => {
    expect(isAllowedVideoEmbedSrc("https://evil.com/embed/xyz", "youtube")).toBe(false)
  })

  it.each([123, null, undefined, {}, ["array"]])(
    "rejects a non-string src (%p) regardless of provider",
    (src) => {
      expect(isAllowedVideoEmbedSrc(src, "youtube")).toBe(false)
    }
  )

  it("rejects an unparseable string as a URL", () => {
    expect(isAllowedVideoEmbedSrc("not a url at all", "youtube")).toBe(false)
  })
})
