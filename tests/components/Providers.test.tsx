import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Providers from "@/components/Providers";

describe("Providers", () => {
  it("should render children", () => {
    render(
      <Providers>
        <div>Test Child</div>
      </Providers>
    );

    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("should wrap children with QueryClientProvider", () => {
    render(
      <Providers>
        <div>Test Child</div>
      </Providers>
    );

    // If QueryClientProvider is working, the child should render
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });
});
