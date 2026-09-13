import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CardListSkeleton, ErrorState } from "@/components/shared/AsyncState";

describe("AsyncState", () => {
  it("renders retry action", () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Network error" onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Network error");
    fireEvent.click(screen.getByRole("button", { name: "Coba lagi" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("renders requested skeleton count", () => {
    render(<CardListSkeleton count={4} />);
    expect(screen.getByLabelText("Loading events").children).toHaveLength(4);
  });
});
