import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SignagePanel from "@/components/dashboard/SignagePanel";

vi.mock("qrcode", () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue("data:image/png;base64,qr"),
  },
}));

describe("SignagePanel", () => {
  beforeEach(() => {
    vi.spyOn(window, "print").mockImplementation(() => undefined);
  });

  it("renders QR signage and switches templates", async () => {
    render(<SignagePanel eventTitle="Wedding Rani" eventType="wedding" slug="wedding-rani" />);

    expect(screen.getByText("QR Signage")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByAltText("QR code Wedding Rani")).toBeInTheDocument());

    const preview = screen.getByAltText("QR code Wedding Rani").closest(".signage-preview");
    fireEvent.click(screen.getByRole("button", { name: "Square" }));
    expect(preview).toHaveAttribute("data-template", "SQUARE");
    expect(screen.queryByText("Scan untuk berbagi foto")).not.toBeInTheDocument();
    expect(screen.queryByText("Wedding Rani")).not.toBeInTheDocument();
    expect(screen.queryByText("Abadikan momen bahagia bersama kami")).not.toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Theme signage" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Floral/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Birthday/ })).toBeInTheDocument();
    expect(preview).toHaveAttribute("data-theme", "floral");
    fireEvent.click(screen.getByRole("radio", { name: /Birthday/ }));
    expect(preview).toHaveAttribute("data-theme", "birthday");
    expect(screen.getByRole("button", { name: "Tambahkan logo" })).toBeInTheDocument();
  });

  it("offers local QR download", async () => {
    render(<SignagePanel eventTitle="Birthday" slug="birthday" />);
    await waitFor(() => expect(screen.getByAltText("QR code Birthday")).toBeInTheDocument());

    expect(screen.getByRole("button", { name: "Download QR" })).toBeInTheDocument();
  });

  it("loads saved customization and saves updated values", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <SignagePanel
        eventTitle="Saved event"
        slug="saved-event"
        initialColorPreset="forest"
        initialLogoUrl="https://example.com/old.png"
        onSave={onSave}
      />,
    );

    expect(screen.getByRole("radio", { name: /Floral/ })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("button", { name: "Ganti logo" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: /Floral/ }));
    fireEvent.click(screen.getByRole("button", { name: "Ganti logo" }));
    fireEvent.change(screen.getByLabelText("URL logo"), { target: { value: "https://example.com/new.png" } });
    fireEvent.click(screen.getByRole("button", { name: "Pakai URL" }));
    fireEvent.click(screen.getByRole("button", { name: "Simpan pengaturan" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({
      colorPreset: "floral",
      logoUrl: "https://example.com/new.png",
    }));
    expect(screen.getByRole("status")).toHaveTextContent("Tersimpan");
  });

  it("shows save errors", async () => {
    const onSave = vi.fn().mockRejectedValue(new Error("Gagal API"));
    render(<SignagePanel eventTitle="Error event" slug="error-event" onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: "Simpan pengaturan" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Gagal API"));
  });
});
