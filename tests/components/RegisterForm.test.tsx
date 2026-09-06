import type { ReactElement } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RegisterForm from "@/app/(auth)/register/RegisterForm";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

function renderWithQuery(ui: ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

const mockUser = {
  id: "u1",
  email: "sari@example.com",
  name: "Sari",
  role: "host",
  createdAt: "2026-09-06T00:00:00Z",
};

describe("RegisterForm", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockUser }),
    }) as unknown as typeof fetch;
  });

  it("renders name, email, password fields and submit button", () => {
    renderWithQuery(<RegisterForm />);
    expect(screen.getByLabelText("Nama")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Daftar" })).toBeInTheDocument();
  });

  it("posts registration data to the register API", async () => {
    renderWithQuery(<RegisterForm />);
    fireEvent.change(screen.getByLabelText("Nama"), {
      target: { value: "Sari" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "sari@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret123" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Daftar" }));
    });
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/auth/register",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            name: "Sari",
            email: "sari@example.com",
            password: "secret123",
          }),
        })
      )
    );
  });

  it("shows an error message when registration fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        error: { code: "EMAIL_EXISTS", message: "Email sudah terdaftar" },
      }),
    }) as unknown as typeof fetch;

    renderWithQuery(<RegisterForm />);
    fireEvent.change(screen.getByLabelText("Nama"), {
      target: { value: "Sari" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "sari@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret123" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Daftar" }));
    });
    await waitFor(() =>
      expect(screen.getByText("Email sudah terdaftar")).toBeInTheDocument()
    );
  });
});
