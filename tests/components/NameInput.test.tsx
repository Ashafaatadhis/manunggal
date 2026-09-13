import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NameInput from "@/components/guest/NameInput";

describe("NameInput", () => {
  const mockOnNameSet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should render name input field", () => {
    render(<NameInput onNameSet={mockOnNameSet} />);

    expect(
      screen.getByPlaceholderText("Masukkan namamu")
    ).toBeInTheDocument();
  });

  it("should render save and skip buttons", () => {
    render(<NameInput onNameSet={mockOnNameSet} />);

    expect(screen.getByText("Simpan")).toBeInTheDocument();
    expect(screen.getByText("Lewati")).toBeInTheDocument();
  });

  it("should call onNameSet with input value when save is clicked", () => {
    render(<NameInput onNameSet={mockOnNameSet} />);

    const input = screen.getByPlaceholderText("Masukkan namamu");
    fireEvent.change(input, { target: { value: "Rian" } });
    fireEvent.click(screen.getByText("Simpan"));

    expect(mockOnNameSet).toHaveBeenCalledWith("Rian");
  });

  it("should show saved name immediately after save", () => {
    render(<NameInput onNameSet={mockOnNameSet} />);

    fireEvent.change(screen.getByPlaceholderText("Masukkan namamu"), {
      target: { value: "Rian" },
    });
    fireEvent.click(screen.getByText("Simpan"));

    expect(screen.getByText(/Halo,/)).toBeInTheDocument();
    expect(screen.getByText("Rian")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Masukkan namamu")).not.toBeInTheDocument();
  });

  it("should call onNameSet with Anonymous when skip is clicked", () => {
    render(<NameInput onNameSet={mockOnNameSet} />);

    fireEvent.click(screen.getByText("Lewati"));

    expect(mockOnNameSet).toHaveBeenCalledWith("Anonymous");
  });

  it("should save name to localStorage", () => {
    render(<NameInput onNameSet={mockOnNameSet} />);

    const input = screen.getByPlaceholderText("Masukkan namamu");
    fireEvent.change(input, { target: { value: "Rian" } });
    fireEvent.click(screen.getByText("Simpan"));

    expect(localStorage.getItem("guestName")).toBe("Rian");
  });

  it("should show saved name if exists in localStorage", () => {
    localStorage.setItem("guestName", "Rian");

    render(<NameInput onNameSet={mockOnNameSet} />);

    expect(screen.getByText("Rian")).toBeInTheDocument();
  });

  it("should call onNameSet with saved name on mount", () => {
    localStorage.setItem("guestName", "Rian");

    render(<NameInput onNameSet={mockOnNameSet} />);

    expect(mockOnNameSet).toHaveBeenCalledWith("Rian");
  });
});
