import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EventCard from "@/components/dashboard/EventCard";
import type { Event } from "@/lib/types";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const event: Event & { photos: number } = {
  id: "event-1",
  hostId: "host-1",
  title: "Wedding Nopal & Ratu",
  slug: "wedding-nopal-ratu",
  date: new Date("2026-09-11T00:00:00.000Z"),
  startTime: new Date("2026-09-11T10:00:00.000Z"),
  endTime: new Date("2026-09-11T20:00:00.000Z"),
  venue: "Apartement Marres",
  eventType: "wedding",
  status: "active",
  settings: {},
  branding: {},
  createdAt: new Date("2026-09-01T00:00:00.000Z"),
  photos: 3,
};

describe("EventCard", () => {
  it("renders event details with accessible icon labels and no emoji metadata", () => {
    render(<EventCard event={event} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/events/event-1");
    expect(screen.getByText("Wedding Nopal & Ratu")).toBeInTheDocument();
    expect(screen.getByText("Wedding")).toBeInTheDocument();
    expect(screen.getByText("Apartement Marres")).toBeInTheDocument();
    expect(screen.getByText("3 photos")).toBeInTheDocument();
    expect(screen.queryByText(/📅|🏷️|📍|📷/)).not.toBeInTheDocument();
  });
});
