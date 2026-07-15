import { describe, it, expect } from "vitest"
import { parseLines, parseNumbers } from "../chart/build-option"

describe("parseLines", () => {
  it("splits on commas", () => {
    expect(parseLines("a,b,c")).toEqual(["a", "b", "c"])
  })

  it("splits on newlines", () => {
    expect(parseLines("a\nb\nc")).toEqual(["a", "b", "c"])
  })

  it("splits on a mix of commas and newlines", () => {
    expect(parseLines("a,b\nc")).toEqual(["a", "b", "c"])
  })

  it("trims surrounding whitespace on each entry", () => {
    expect(parseLines("  a , b ,c  ")).toEqual(["a", "b", "c"])
  })

  it("drops empty entries from consecutive separators", () => {
    expect(parseLines("a,,b,\n\nc")).toEqual(["a", "b", "c"])
  })

  it("returns an empty array for blank input", () => {
    expect(parseLines("")).toEqual([])
    expect(parseLines("   \n  ")).toEqual([])
  })
})

describe("parseNumbers", () => {
  it("parses a comma-separated list of numbers", () => {
    expect(parseNumbers("1,2,3")).toEqual([1, 2, 3])
  })

  it("parses decimals and negative numbers", () => {
    expect(parseNumbers("1.5,-2,0")).toEqual([1.5, -2, 0])
  })

  it("filters out non-numeric tokens", () => {
    expect(parseNumbers("1,abc,3")).toEqual([1, 3])
  })

  it("returns an empty array when nothing is numeric", () => {
    expect(parseNumbers("a,b,c")).toEqual([])
  })
})
