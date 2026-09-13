import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@gsap/react", () => ({
  useGSAP: () => undefined,
}));

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    set: vi.fn(),
    timeline: vi.fn(() => ({ to: vi.fn().mockReturnThis() })),
  },
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {},
}));

import HeroParallax from "@/components/marketing/HeroParallax";

describe("HeroParallax", () => {
  it("renders hero content and event image", () => {
    render(<HeroParallax />);

    expect(document.querySelector("section")).toHaveClass("h-[100svh]");
    expect(document.querySelector("section > div:last-of-type")).toHaveClass("items-center", "py-0");
    expect(document.querySelector("section > div:last-of-type")).toHaveClass("max-w-6xl");
    expect(screen.getByText("Momen, langsung terkumpul")).toBeInTheDocument();
    expect(document.querySelector(".hero-parallax-image")).toHaveAttribute(
      "src",
      expect.stringContaining("images.unsplash.com")
    );
    expect(screen.getByRole("link", { name: /mulai acara gratis/i })).toHaveAttribute(
      "href",
      "/register"
    );
  });
});
