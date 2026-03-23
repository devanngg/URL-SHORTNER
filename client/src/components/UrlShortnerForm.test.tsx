import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import { UrlShortnerForm } from "./UrlShortnerForm"
import { renderWithProviders } from "@/utils/test-utils"

// Mock the urlService so tests don't make real HTTP requests
vi.mock("@/features/url-shortener/services/urlService", () => ({
  shortenUrl: vi.fn(),
}))

import { shortenUrl } from "@/features/url-shortener/services/urlService"
const mockShortenUrl = vi.mocked(shortenUrl)

describe("UrlShortnerForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the form with input and submit button", () => {
    renderWithProviders(<UrlShortnerForm />)
    expect(screen.getByPlaceholderText(/https:\/\/example\.com/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /shorten it/i })).toBeInTheDocument()
  })

  it("shows loading state while request is in progress", async () => {
    // Never resolves so loading stays true
    mockShortenUrl.mockReturnValue(new Promise(() => {}))
    const { user } = renderWithProviders(<UrlShortnerForm />)

    await user.type(screen.getByPlaceholderText(/https:\/\/example\.com/i), "https://google.com")
    await user.click(screen.getByRole("button", { name: /shorten it/i }))

    expect(await screen.findByRole("button", { name: /shortening/i })).toBeDisabled()
  })

  it("displays the short URL after successful submission", async () => {
    mockShortenUrl.mockResolvedValue({
      shortUrl: "http://localhost/abc123",
      originalUrl: "https://google.com",
    })
    const { user } = renderWithProviders(<UrlShortnerForm />)

    await user.type(screen.getByPlaceholderText(/https:\/\/example\.com/i), "https://google.com")
    await user.click(screen.getByRole("button", { name: /shorten it/i }))

    await waitFor(() => {
      expect(screen.getByText("http://localhost/abc123")).toBeInTheDocument()
    })
  })

  it("shows Copy URL and Show QR buttons after success", async () => {
    mockShortenUrl.mockResolvedValue({
      shortUrl: "http://localhost/abc123",
      originalUrl: "https://google.com",
    })
    const { user } = renderWithProviders(<UrlShortnerForm />)

    await user.type(screen.getByPlaceholderText(/https:\/\/example\.com/i), "https://google.com")
    await user.click(screen.getByRole("button", { name: /shorten it/i }))

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /copy url/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /show qr/i })).toBeInTheDocument()
    })
  })

  it("toggles QR code panel when Show QR is clicked", async () => {
    mockShortenUrl.mockResolvedValue({
      shortUrl: "http://localhost/abc123",
      originalUrl: "https://google.com",
    })
    const { user } = renderWithProviders(<UrlShortnerForm />)

    await user.type(screen.getByPlaceholderText(/https:\/\/example\.com/i), "https://google.com")
    await user.click(screen.getByRole("button", { name: /shorten it/i }))

    await waitFor(() => screen.getByRole("button", { name: /show qr/i }))

    // Click Show QR — QR panel + Close button should appear
    await user.click(screen.getByRole("button", { name: /show qr/i }))
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /hide qr/i })).toBeInTheDocument()

    // Click Close — QR panel should disappear
    await user.click(screen.getByRole("button", { name: /close/i }))
    expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument()
  })

  it("displays error message when request fails", async () => {
    mockShortenUrl.mockRejectedValue({ response: { data: "Failed to shorten Url" } })
    const { user } = renderWithProviders(<UrlShortnerForm />)

    await user.type(screen.getByPlaceholderText(/https:\/\/example\.com/i), "https://google.com")
    await user.click(screen.getByRole("button", { name: /shorten it/i }))

    await waitFor(() => {
      expect(screen.getByText(/failed to shorten url/i)).toBeInTheDocument()
    })
  })
})
