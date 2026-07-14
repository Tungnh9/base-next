export type VideoProvider = "youtube" | "vimeo" | "file"

export interface ParsedVideoUrl {
  provider: VideoProvider
  embedUrl: string
}

// Accepts a YouTube/Vimeo watch URL or a direct video file URL and returns
// its playable src. Returns null for anything else — callers show an
// "invalid URL" error.
export function parseVideoUrl(rawUrl: string): ParsedVideoUrl | null {
  const trimmed = rawUrl.trim()
  if (!trimmed) return null

  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&?/\s]{11})/
  )
  if (ytMatch) {
    return { provider: "youtube", embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` }
  }

  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch) {
    return { provider: "vimeo", embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` }
  }

  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed) || trimmed.startsWith("blob:")) {
    return { provider: "file", embedUrl: trimmed }
  }

  return null
}

const ALLOWED_EMBED_HOSTS = ["www.youtube.com", "player.vimeo.com"]

// Node-level guard — parseVideoUrl() only runs in the toolbar dialog, but the
// `video` node's src attribute could in principle be set through other paths
// (paste, imported JSON). Re-validate here before ever rendering an iframe.
export function isAllowedVideoEmbedSrc(src: unknown, provider: unknown): src is string {
  if (typeof src !== "string") return false
  if (provider === "file")
    return src.startsWith("blob:") || /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(src)
  try {
    const url = new URL(src)
    return url.protocol === "https:" && ALLOWED_EMBED_HOSTS.includes(url.hostname)
  } catch {
    return false
  }
}
