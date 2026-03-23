import { describe, it, expect } from "vitest"
import urlReducer, { resetUrl, shortenUrlAsync } from "./urlSlice"

const initialState = { result: null, loading: false, error: null }

describe("urlSlice reducer", () => {
  it("returns initial state", () => {
    expect(urlReducer(undefined, { type: "unknown" })).toEqual(initialState)
  })

  it("resetUrl clears result and error", () => {
    const state = {
      result: { shortUrl: "http://localhost/abc123", originalUrl: "https://example.com" },
      loading: false,
      error: "some error",
    }
    expect(urlReducer(state, resetUrl())).toEqual(initialState)
  })

  it("sets loading=true and clears error on pending", () => {
    const state = urlReducer(initialState, shortenUrlAsync.pending("", "https://example.com"))
    expect(state.loading).toBe(true)
    expect(state.error).toBeNull()
  })

  it("stores result and sets loading=false on fulfilled", () => {
    const payload = { shortUrl: "http://localhost/abc123", originalUrl: "https://example.com" }
    const state = urlReducer(initialState, shortenUrlAsync.fulfilled(payload, "", "https://example.com"))
    expect(state.loading).toBe(false)
    expect(state.result).toEqual(payload)
  })

  it("stores error and sets loading=false on rejected", () => {
    const state = urlReducer(
      initialState,
      shortenUrlAsync.rejected(null, "", "https://example.com", "Failed to shorten Url"),
    )
    expect(state.loading).toBe(false)
    expect(state.error).toBe("Failed to shorten Url")
  })
})
