import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Header from "@/components/shared/Header";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("Header", () => {
  it("should render Manunggal logo", () => {
    render(<Header />);

    expect(screen.getByText("Manunggal")).toBeInTheDocument();
  });

  it("should render navigation links", () => {
    render(<Header />);

    expect(screen.getByText("Cara Kerja")).toBeInTheDocument();
    expect(screen.getByText("Harga")).toBeInTheDocument();
    expect(screen.queryByText("Masuk")).not.toBeInTheDocument();
    expect(screen.getByText("Coba Gratis")).toBeInTheDocument();
  });

  it("should use white navigation text over the hero", () => {
    render(<Header />);

    expect(document.querySelector("header")).toHaveAttribute("data-light-content", "true");
  });

  it("should have correct link hrefs", () => {
    render(<Header />);

    const logoLink = screen.getByText("Manunggal").closest("a");
    expect(logoLink).toHaveAttribute("href", "/");

    const caraKerjaLink = screen.getByText("Cara Kerja").closest("a");
    expect(caraKerjaLink).toHaveAttribute("href", "#cara-kerja");

    const hargaLink = screen.getByText("Harga").closest("a");
    expect(hargaLink).toHaveAttribute("href", "#harga");

    const cobaGratisLink = screen.getByText("Coba Gratis").closest("a");
    expect(cobaGratisLink).toHaveAttribute("href", "/register");
  });

  it("should toggle mobile navigation", async () => {
    render(<Header />);

    const menuButton = screen.getByRole("button", { name: "Buka menu" });
    expect(screen.queryByRole("navigation", { name: "Navigasi mobile" })).not.toBeInTheDocument();

    fireEvent.click(menuButton);
    expect(screen.getByRole("navigation", { name: "Navigasi mobile" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tutup menu" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Tutup menu" }));
    await waitFor(() =>
      expect(screen.queryByRole("navigation", { name: "Navigasi mobile" })).not.toBeInTheDocument()
    );
  });

  it("should shrink into a floating surface after scrolling", () => {
    render(<Header />);
    const surface = document.querySelector("[data-scrolled]");
    expect(surface).toHaveAttribute("data-scrolled", "false");
    expect(surface).toHaveClass("backdrop-blur-none");

    Object.defineProperty(window, "scrollY", { configurable: true, value: 80 });
    fireEvent.scroll(window);
    expect(surface).toHaveAttribute("data-scrolled", "true");
    expect(surface).toHaveClass("backdrop-blur-xl");
  });

  it("should keep white text while scrolling inside hero", () => {
    const hero = document.createElement("section");
    vi.spyOn(hero, "getBoundingClientRect").mockReturnValue({ bottom: 720 } as DOMRect);
    hero.setAttribute("data-hero", "true");
    document.body.appendChild(hero);

    render(<Header />);
    Object.defineProperty(window, "scrollY", { configurable: true, value: 80 });
    fireEvent.scroll(window);

    expect(document.querySelector("header")).toHaveAttribute("data-light-content", "true");
    hero.remove();
  });
});
