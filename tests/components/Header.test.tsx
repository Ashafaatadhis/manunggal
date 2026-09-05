import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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

describe("Header", () => {
  it("should render Manunggal logo", () => {
    render(<Header />);

    expect(screen.getByText("Manunggal")).toBeInTheDocument();
  });

  it("should render navigation links", () => {
    render(<Header />);

    expect(screen.getByText("Cara Kerja")).toBeInTheDocument();
    expect(screen.getByText("Harga")).toBeInTheDocument();
    expect(screen.getByText("Masuk")).toBeInTheDocument();
    expect(screen.getByText("Coba Gratis")).toBeInTheDocument();
  });

  it("should have correct link hrefs", () => {
    render(<Header />);

    const logoLink = screen.getByText("Manunggal").closest("a");
    expect(logoLink).toHaveAttribute("href", "/");

    const caraKerjaLink = screen.getByText("Cara Kerja").closest("a");
    expect(caraKerjaLink).toHaveAttribute("href", "/cara-kerja");

    const hargaLink = screen.getByText("Harga").closest("a");
    expect(hargaLink).toHaveAttribute("href", "/harga");

    const masukLink = screen.getByText("Masuk").closest("a");
    expect(masukLink).toHaveAttribute("href", "/login");

    const cobaGratisLink = screen.getByText("Coba Gratis").closest("a");
    expect(cobaGratisLink).toHaveAttribute("href", "/register");
  });
});
