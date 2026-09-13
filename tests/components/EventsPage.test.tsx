import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import EventsPage from "@/app/(dashboard)/events/page";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const events = [
  {
    id: "1", hostId: "h", title: "Rani Wedding", slug: "rani", eventType: "wedding",
    date: new Date("2026-01-01"), startTime: new Date(), endTime: new Date(), status: "active",
    settings: {}, branding: {}, createdAt: new Date(), photos: 2,
  },
  {
    id: "2", hostId: "h", title: "Budi Birthday", slug: "budi", eventType: "birthday",
    date: new Date("2026-01-01"), startTime: new Date(), endTime: new Date(), status: "draft",
    settings: {}, branding: {}, createdAt: new Date(), photos: 0,
  },
];

describe("EventsPage", () => {
  it("filters events by title and uses white search background", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data: events }) }));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={queryClient}><EventsPage /></QueryClientProvider>);

    const search = await screen.findByRole("textbox", { name: "Search events" });
    expect(search).toHaveClass("bg-white");
    fireEvent.change(search, { target: { value: "Budi" } });
    expect(screen.getByText("Budi Birthday")).toBeInTheDocument();
    expect(screen.queryByText("Rani Wedding")).not.toBeInTheDocument();
  });
});
