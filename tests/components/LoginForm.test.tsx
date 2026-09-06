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
import LoginForm from "@/app/(auth)/login/LoginForm";

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
  email: "rian@example.com",
  name: "Rian",
  role: "host",
  createdAt: "2026-09-06T00:00:00Z",
};

describe("LoginForm", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockUser }),
    }) as unknown as typeof fetch;
  });

  it("renders email and password fields and submit button", () => {
    renderWithQuery(<LoginForm />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Masuk" })).toBeInTheDocument();
  });

  it("posts credentials to the login API", async () => {
    renderWithQuery(<LoginForm />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "rian@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret123" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Masuk" }));
    });
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/auth/login",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            email: "rian@example.com",
            password: "secret123",
          }),
        })
      )
    );
  });

  it("shows an error message when login fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Email atau password salah" },
      }),
    }) as unknown as typeof fetch;

    renderWithQuery(<LoginForm />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "rian@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrongpass" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Masuk" }));
    });
    await waitFor(() =>
      expect(
        screen.getByText("Email atau password salah")
      ).toBeInTheDocument()
    );
  });
});
