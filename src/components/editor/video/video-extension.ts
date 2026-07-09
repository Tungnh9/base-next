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

// Embeds a YouTube/Vimeo iframe as an atomic block node. UI-only for now —
// only remote embed URLs are supported, no file upload yet.
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
          const src = element.querySelector("iframe")?.getAttribute("src") ?? null
          return isAllowedVideoEmbedSrc(src) ? src : null
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
    if (!isAllowedVideoEmbedSrc(HTMLAttributes.src)) {
      return ["div", wrapperAttrs]
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
