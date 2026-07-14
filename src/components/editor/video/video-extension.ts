import { Node, mergeAttributes } from "@tiptap/core"
import { isAllowedVideoEmbedSrc } from "./parse-video-url"

export interface VideoOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      setVideo: (attrs: { src: string; provider?: string }) => ReturnType
    }
  }
}

// Embeds a YouTube/Vimeo iframe, or a direct/blob video file, as an atomic
// block node. File uploads are session-local blob URLs — no backend/storage
// wiring yet.
export const Video = Node.create<VideoOptions>({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} }
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => {
          const provider = element.getAttribute("data-provider")
          const src =
            element.querySelector("iframe")?.getAttribute("src") ??
            element.querySelector("video")?.getAttribute("src") ??
            null
          return isAllowedVideoEmbedSrc(src, provider) ? src : null
        },
      },
      provider: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-provider"),
      },
    }
  },

  parseHTML() {
    return [{ tag: "div[data-video-embed]" }]
  },

  renderHTML({ HTMLAttributes }) {
    const wrapperAttrs = mergeAttributes(this.options.HTMLAttributes, {
      "data-video-embed": "",
      "data-provider": HTMLAttributes.provider,
      class: "video-embed",
    })

    // Re-check here too — attrs can be set via insertContent()/JSON without
    // going through the toolbar dialog's parseVideoUrl() validation.
    if (!isAllowedVideoEmbedSrc(HTMLAttributes.src, HTMLAttributes.provider)) {
      return ["div", wrapperAttrs]
    }

    if (HTMLAttributes.provider === "file") {
      return [
        "div",
        wrapperAttrs,
        ["video", { src: HTMLAttributes.src, controls: "true", preload: "metadata" }],
      ]
    }

    return [
      "div",
      wrapperAttrs,
      [
        "iframe",
        {
          src: HTMLAttributes.src,
          frameborder: "0",
          allow:
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
          allowfullscreen: "true",
        },
      ],
    ]
  },

  addCommands() {
    return {
      setVideo:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    }
  },
})
