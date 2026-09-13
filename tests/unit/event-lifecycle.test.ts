import { describe, expect, it } from "vitest";
import { canChangeEventStatus, getEventStatusAction } from "@/lib/event-lifecycle";

describe("event lifecycle", () => {
  it("allows draft activation and active/live ending", () => {
    expect(canChangeEventStatus("draft", "active")).toBe(true);
    expect(canChangeEventStatus("active", "ended")).toBe(true);
    expect(canChangeEventStatus("live", "ended")).toBe(true);
  });

  it("rejects invalid status changes", () => {
    expect(canChangeEventStatus("draft", "ended")).toBe(false);
    expect(canChangeEventStatus("ended", "active")).toBe(false);
    expect(getEventStatusAction("draft")).toBe("activate");
    expect(getEventStatusAction("ended")).toBeNull();
  });
});
