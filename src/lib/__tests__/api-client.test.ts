import { describe, it, expect, vi, beforeEach } from "vitest"

const mockRequest = vi.fn()

vi.mock("axios", async () => {
  const actual = await vi.importActual<typeof import("axios")>("axios")
  return {
    ...actual,
    default: {
      ...actual.default,
      create: () => ({ request: mockRequest }),
    },
  }
})

import { ApiClient, ApiClientError } from "../api-client"

describe("ApiClient", () => {
  beforeEach(() => vi.clearAllMocks())

  const client = new ApiClient({ baseURL: "https://api.example.com" })

  it("unwraps { data, timestamp } envelope", async () => {
    mockRequest.mockResolvedValue({ data: { data: { id: "1" }, timestamp: "now" } })

    const result = await client.get<{ id: string }>("/users/1")

    expect(result).toEqual({ id: "1" })
  })

  it("returns raw body when there is no envelope", async () => {
    mockRequest.mockResolvedValue({ data: { id: "1" } })

    const result = await client.get<{ id: string }>("/users/1")

    expect(result).toEqual({ id: "1" })
  })

  it("throws ApiClientError with backend error body on failure", async () => {
    mockRequest.mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 404,
        data: { statusCode: 404, message: "Not found", timestamp: "now", path: "/users/1" },
      },
    })

    await expect(client.get("/users/1")).rejects.toMatchObject({
      status: 404,
      message: "Not found",
    })
  })

  it("picks the first message when backend returns a validation array", async () => {
    mockRequest.mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          statusCode: 400,
          message: ["email must be valid", "password too short"],
          timestamp: "now",
          path: "/auth/register",
        },
      },
    })

    await expect(client.post("/auth/register")).rejects.toMatchObject({
      status: 400,
      message: "email must be valid",
    })
  })

  it("normalizes a network error (no response) to status 0", async () => {
    mockRequest.mockRejectedValue({ isAxiosError: true, message: "Network Error" })

    await expect(client.get("/users/1")).rejects.toBeInstanceOf(ApiClientError)
    await expect(client.get("/users/1")).rejects.toMatchObject({ status: 0, code: "NETWORK_ERROR" })
  })

  it("normalizes a timeout to status 408", async () => {
    mockRequest.mockRejectedValue({ isAxiosError: true, code: "ECONNABORTED", message: "timeout" })

    await expect(client.get("/users/1")).rejects.toMatchObject({ status: 408, code: "TIMEOUT" })
  })
})
