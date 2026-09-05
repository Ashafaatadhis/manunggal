import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/shared/Footer";

describe("Footer", () => {
  it("should render copyright text", () => {
    render(<Footer />);

    expect(
      screen.getByText(/© 2026 Manunggal/)
    ).toBeInTheDocument();
  });

  it("should render social media links", () => {
    render(<Footer />);

    expect(screen.getByText("Instagram")).toBeInTheDocument();
    expect(screen.getByText("TikTok")).toBeInTheDocument();
  });

  it("should have correct social media hrefs", () => {
    render(<Footer />);

    const instagramLink = screen.getByText("Instagram").closest("a");
    expect(instagramLink).toHaveAttribute("href", "https://instagram.com");

    const tiktokLink = screen.getByText("TikTok").closest("a");
    expect(tiktokLink).toHaveAttribute("href", "https://tiktok.com");
  });
});
