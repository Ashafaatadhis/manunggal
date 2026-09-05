import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PhotoCard from "@/components/guest/PhotoCard";
import type { Photo } from "@/lib/types";

const mockPhoto: Photo = {
  id: "photo-123",
  eventId: "event-456",
  fileKey: "key-789",
  fileUrl: "https://example.com/photo.jpg",
  fileProvider: "cloudinary",
  thumbnailUrl: "https://example.com/thumb.jpg",
  guestName: "Rian",
  message: "Selamat ya!",
  status: "approved",
  metadata: { width: 1920, height: 1080, format: "jpg" },
  uploadedAt: new Date("2024-12-25T20:14:00"),
};

describe("PhotoCard", () => {
  it("should render photo image", () => {
    render(<PhotoCard photo={mockPhoto} />);

    const img = screen.getByAltText("Foto oleh Rian");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", mockPhoto.fileUrl);
  });

  it("should render guest name", () => {
    render(<PhotoCard photo={mockPhoto} />);

    expect(screen.getByText("Rian")).toBeInTheDocument();
  });

  it("should render message if provided", () => {
    render(<PhotoCard photo={mockPhoto} />);

    expect(screen.getByText("Selamat ya!")).toBeInTheDocument();
  });

  it("should render Anonymous if no guest name", () => {
    const photoWithoutName = { ...mockPhoto, guestName: null };
    render(<PhotoCard photo={photoWithoutName} />);

    expect(screen.getByText("Anonymous")).toBeInTheDocument();
  });

  it("should not render message section if no message", () => {
    const photoWithoutMessage = { ...mockPhoto, message: null };
    render(<PhotoCard photo={photoWithoutMessage} />);

    expect(screen.queryByText("Selamat ya!")).not.toBeInTheDocument();
  });

  it("should render formatted time", () => {
    render(<PhotoCard photo={mockPhoto} />);

    // Time is formatted as "20.14" (HH.MM format)
    const timeElement = screen.getByText("20.14");
    expect(timeElement).toBeInTheDocument();
  });
});
