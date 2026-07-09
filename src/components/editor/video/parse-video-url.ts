export type VideoProvider = "youtube" | "vimeo"

const ALLOWED_EMBED_HOSTS = ["www.youtube.com", "player.vimeo.com"]

// Node-level guard — parseVideoUrl() only runs in the toolbar dialog, but the
// `video` node's src attribute could in principle be set through other paths
// (paste, imported JSON). Re-validate here before ever rendering an iframe.
export function isAllowedVideoEmbedSrc(src: unknown): src is string {
  if (typeof src !== "string") return false
  try {
    const url = new URL(src)
    return url.protocol === "https:" && ALLOWED_EMBED_HOSTS.includes(url.hostname)
  } catch {
    return false
  }
}

export interface ParsedVideoUrl {
  provider: VideoProvider
  embedUrl: string
}

// Accepts a YouTube/Vimeo watch URL and returns its embeddable iframe src.
// Returns null for anything else — callers show an "invalid URL" error.
export function parseVideoUrl(rawUrl: string): ParsedVideoUrl | null {
  let url: URL
  try {
    url = new URL(rawUrl.trim())
  } catch {
    return null
  }

  const host = url.hostname.replace(/^www\.|^m\./, "")

  if (host === "youtu.be") {
    const id = url.pathname.slice(1)
    return id ? { provider: "youtube", embedUrl: `https://www.youtube.com/embed/${id}` } : null
  }

  if (host === "youtube.com") {
    if (url.pathname === "/watch") {
      const id = url.searchParams.get("v")
      return id ? { provider: "youtube", embedUrl: `https://www.youtube.com/embed/${id}` } : null
    }
    if (url.pathname.startsWith("/embed/")) {
      return { provider: "youtube", embedUrl: url.toString() }
    }
    if (url.pathname.startsWith("/shorts/")) {
      const id = url.pathname.split("/")[2]
      return id ? { provider: "youtube", embedUrl: `https://www.youtube.com/embed/${id}` } : null
    }
    return null
  }

  if (host === "vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean)[0]
    return id && /^\d+$/.test(id)
      ? { provider: "vimeo", embedUrl: `https://player.vimeo.com/video/${id}` }
      : null
  }

  if (host === "player.vimeo.com") {
    return { provider: "vimeo", embedUrl: url.toString() }
  }

  return null
}
