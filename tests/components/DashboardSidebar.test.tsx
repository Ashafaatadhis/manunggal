import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Sidebar from "@/components/dashboard/Sidebar";

const pushMock = vi.fn();

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: pushMock }),
}));

describe("Dashboard Sidebar", () => {
  it("collapses while keeping navigation icons visible", () => {
    render(<Sidebar />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Kecilkan sidebar" }));

    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Perbesar sidebar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
  });

  it("asks for confirmation before logging out", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch;
    render(<Sidebar />);

    fireEvent.click(screen.getByRole("button", { name: "Keluar" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Keluar dari dashboard?")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();

    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Keluar" }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" }));
    expect(pushMock).toHaveBeenCalledWith("/login");
  });
});
