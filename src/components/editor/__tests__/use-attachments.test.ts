import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { useAttachments } from "../attachment/use-attachments"

function fakeFile(name = "photo.png") {
  return new File(["content"], name, { type: "image/png" })
}

describe("useAttachments", () => {
  let createObjectURLSpy: ReturnType<typeof vi.fn>
  let revokeObjectURLSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.useFakeTimers()
    // jsdom doesn't implement these — stub so addFile()'s completion path can run.
    createObjectURLSpy = vi.fn(() => "blob:mock-url")
    revokeObjectURLSpy = vi.fn()
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: createObjectURLSpy,
      revokeObjectURL: revokeObjectURLSpy,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it("addFile adds an entry with status=uploading and progress=0 immediately", () => {
    const { result } = renderHook(() => useAttachments())

    act(() => result.current.addFile(fakeFile()))

    expect(result.current.attachments).toHaveLength(1)
    expect(result.current.attachments[0]).toMatchObject({
      filename: "photo.png",
      status: "uploading",
      progress: 0,
    })
  })

  it("progress ramps toward 90 while the interval fires, then completes to 100/success with a url", () => {
    const { result } = renderHook(() => useAttachments())
    act(() => result.current.addFile(fakeFile()))
    const id = result.current.attachments[0].id

    act(() => vi.advanceTimersByTime(120))
    expect(result.current.attachments.find((a) => a.id === id)?.progress).toBe(20)

    act(() => vi.advanceTimersByTime(120))
    expect(result.current.attachments.find((a) => a.id === id)?.progress).toBe(40)

    // Completion timeout fires at 600ms total — jump the remaining time.
    act(() => vi.advanceTimersByTime(600))

    const finished = result.current.attachments.find((a) => a.id === id)
    expect(finished).toMatchObject({ status: "success", progress: 100, url: "blob:mock-url" })
    expect(createObjectURLSpy).toHaveBeenCalledOnce()
  })

  it("removeAttachment on an in-flight upload clears its timers so it never later completes", () => {
    const { result } = renderHook(() => useAttachments())
    act(() => result.current.addFile(fakeFile()))
    const id = result.current.attachments[0].id

    act(() => result.current.removeAttachment(id))
    expect(result.current.attachments).toHaveLength(0)

    // If the timers weren't really cleared, this would resurrect the item.
    act(() => vi.advanceTimersByTime(1000))

    expect(result.current.attachments).toHaveLength(0)
    expect(createObjectURLSpy).not.toHaveBeenCalled()
  })

  it("removeAttachment on a completed upload revokes its blob URL", () => {
    const { result } = renderHook(() => useAttachments())
    act(() => result.current.addFile(fakeFile()))
    const id = result.current.attachments[0].id
    act(() => vi.advanceTimersByTime(600))
    expect(result.current.attachments.find((a) => a.id === id)?.status).toBe("success")

    act(() => result.current.removeAttachment(id))

    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url")
  })

  it("unmounting mid-upload clears pending timers and never creates a blob URL afterward", () => {
    const { result, unmount } = renderHook(() => useAttachments())
    act(() => result.current.addFile(fakeFile()))

    unmount()
    act(() => vi.advanceTimersByTime(1000))

    expect(createObjectURLSpy).not.toHaveBeenCalled()
  })

  it("unmounting after completion revokes every attachment's blob URL", () => {
    const { result, unmount } = renderHook(() => useAttachments())
    act(() => result.current.addFile(fakeFile("a.png")))
    act(() => result.current.addFile(fakeFile("b.png")))
    act(() => vi.advanceTimersByTime(600))
    expect(result.current.attachments.every((a) => a.status === "success")).toBe(true)

    unmount()

    expect(revokeObjectURLSpy).toHaveBeenCalledTimes(2)
  })
})
