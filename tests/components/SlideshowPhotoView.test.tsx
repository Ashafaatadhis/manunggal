import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SlideshowPhotoView, {
  transitionClass,
} from "@/components/live/SlideshowPhotoView";
import type { Photo } from "@/lib/types";

const photo: Photo = {
  id: "p1",
  eventId: "evt",
  fileKey: "p1",
  fileUrl: "https://x/p1.jpg",
  fileProvider: "cloudinary",
  thumbnailUrl: "https://x/p1_t.jpg",
  guestName: "Sari",
  message: "Selamat dan sukses!",
  status: "approved",
  metadata: {},
  uploadedAt: new Date("2025-01-01T00:00:00Z"),
};

describe("transitionClass", () => {
  it("maps fade to a fade-in animation utility", () => {
    expect(transitionClass("fade")).toContain("fade-in");
  });

  it("maps slide to a slide-in-from-right utility", () => {
    expect(transitionClass("slide")).toContain("slide-in-from-right-40");
  });

  it("maps zoom to a zoom-in utility", () => {
    expect(transitionClass("zoom")).toContain("zoom-in-75");
  });
});

describe("SlideshowPhotoView", () => {
  it("renders the photo image fullscreen", () => {
    render(
      <SlideshowPhotoView photo={photo} showMessages={true} transition="fade" />
    );
    const img = screen.getByAltText("Foto slideshow");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", photo.fileUrl);
  });

  it("shows the guest message when showMessages is true", () => {
    render(
      <SlideshowPhotoView photo={photo} showMessages={true} transition="fade" />
    );
    expect(screen.getByText("Selamat dan sukses!")).toBeInTheDocument();
    expect(screen.getByText("Sari")).toBeInTheDocument();
  });

  it("hides the message overlay when showMessages is false", () => {
    render(
      <SlideshowPhotoView photo={photo} showMessages={false} transition="fade" />
    );
    expect(screen.queryByText("Selamat dan sukses!")).not.toBeInTheDocument();
  });
});
