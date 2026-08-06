import { render, screen, within, fireEvent, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, afterEach } from "vitest"
import type { Editor } from "@tiptap/react"

import { TooltipProvider } from "@/components/ui/tooltip"
import { VideoDialog } from "../video-dialog"

// VideoDialog never calls chain()/focus()/setVideo()/run() in this test (no
// "Insert" click) — this stub only needs to satisfy the Editor prop's type.
const stubEditor = {} as unknown as Editor

function makeVideoFile(name: string) {
  return new File(["fake-bytes"], name, { type: "video/mp4" })
}

function renderDialog() {
  return render(
    <TooltipProvider>
      <VideoDialog editor={stubEditor} />
    </TooltipProvider>
  )
}

// Navigation (open dialog, switch tab) runs under REAL timers via userEvent,
// which needs real/hybrid time to resolve its own internal pointer-event
// sequencing. Fake timers are only switched on afterwards, right before the
// timing-sensitive part each test actually exercises — this avoids the
// flakiness of mixing userEvent with a hybrid real+fake timer mode.
async function openUploadTabWithRealTimers() {
  const user = userEvent.setup()
  const rendered = renderDialog()

  await user.click(screen.getByRole("button", { name: "toolbar.video" }))
  await user.click(screen.getByRole("tab", { name: "video.uploadTab" }))

  const dialog = screen.getByRole("dialog")
  const fileInput = dialog.querySelector('input[type="file"]') as HTMLInputElement
  return { ...rendered, dialog, fileInput }
}

describe("VideoDialog upload — stale timer regression guard", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("cancels the in-flight completion timeout on unmount, instead of leaking a blob URL", async () => {
    const { unmount, dialog, fileInput } = await openUploadTabWithRealTimers()

    vi.useFakeTimers()
    vi.mocked(URL.createObjectURL).mockClear()

    fireEvent.change(fileInput, { target: { files: [makeVideoFile("first.mp4")] } })
    expect(within(dialog).getByText("video.uploading")).toBeInTheDocument()

    // Unmount mid-upload, before the 600ms completion timeout fires —
    // mirrors navigating away from the editor while an upload is in flight.
    act(() => vi.advanceTimersByTime(300))
    unmount()

    // The stale timeout would fire right about now (600ms after it was
    // scheduled) if it weren't cancelled by the unmount cleanup — and would
    // call setState on the now-unmounted component to boot.
    act(() => vi.advanceTimersByTime(400))

    expect(URL.createObjectURL).not.toHaveBeenCalled()
  })

  it("still completes normally when left alone (sanity check for the regression guard above)", async () => {
    const { dialog, fileInput } = await openUploadTabWithRealTimers()

    vi.useFakeTimers()
    vi.mocked(URL.createObjectURL).mockClear()

    fireEvent.change(fileInput, { target: { files: [makeVideoFile("first.mp4")] } })
    act(() => vi.advanceTimersByTime(700))

    expect(within(dialog).getByText("video.uploadSuccess")).toBeInTheDocument()
    expect(within(dialog).getByText("first.mp4")).toBeInTheDocument()
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
  })
})
