import type { ReactElement } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SlideshowPanel from "@/components/dashboard/SlideshowPanel";

function renderWithQuery(ui: ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe("SlideshowPanel", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { published: true } }),
    }) as unknown as typeof fetch;
  });

  it("renders link to open slideshow screen", () => {
    renderWithQuery(<SlideshowPanel eventId="e1" slug="my-event" />);
    expect(screen.getByText("Buka layar venue")).toBeInTheDocument();
  });

  it("sends pause command", async () => {
    renderWithQuery(<SlideshowPanel eventId="e1" slug="my-event" />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /jeda/i }));
    });
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/events/e1/slideshow/control",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"type":"pause"'),
        })
      )
    );
  });

  it("toggles pause and resume in one button", async () => {
    renderWithQuery(<SlideshowPanel eventId="e1" slug="my-event" />);
    const toggle = screen.getByRole("button", { name: "Jeda slideshow" });

    await act(async () => {
      fireEvent.click(toggle);
    });
    expect(screen.getByRole("button", { name: "Lanjutkan slideshow" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Lanjutkan slideshow" }));
    });
    await waitFor(() =>
      expect(global.fetch).toHaveBeenLastCalledWith(
        "/api/events/e1/slideshow/control",
        expect.objectContaining({ body: expect.stringContaining('"type":"resume"') }),
      ),
    );
  });
});
