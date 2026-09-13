import { describe, expect, it } from "vitest";
import {
  getSignageFilename,
  EVENT_SIGNAGE_COPY,
  QR_THEMES,
  QR_COLOR_PRESETS,
  SIGNAGE_TEMPLATES,
  type SignageTemplate,
} from "@/lib/signage";

describe("signage", () => {
  it("exposes A4, A5, and square templates", () => {
    expect(Object.keys(SIGNAGE_TEMPLATES)).toEqual(["A4", "A5", "SQUARE"]);
  });

  it("keeps template labels and aspect classes", () => {
    for (const key of Object.keys(SIGNAGE_TEMPLATES) as SignageTemplate[]) {
      expect(SIGNAGE_TEMPLATES[key].label).toBeTruthy();
      expect(SIGNAGE_TEMPLATES[key].className).toContain("aspect-");
    }
  });

  it("creates stable PDF filenames", () => {
    expect(getSignageFilename("wedding-rani", "A4")).toBe(
      "manunggal-wedding-rani-signage-a4.pdf"
    );
    expect(getSignageFilename("party", "SQUARE")).toBe(
      "manunggal-party-signage-square.pdf"
    );
  });

  it("provides signage themes and event type presets", () => {
    expect(QR_THEMES.floral.patternClass).toContain("radial-gradient");
    expect(QR_THEMES.birthday.patternClass).toContain("radial-gradient");
    expect(QR_COLOR_PRESETS.floral.dark).toBe("#111827");
    expect(QR_COLOR_PRESETS.birthday.dark).toBe("#111827");
    expect(EVENT_SIGNAGE_COPY.wedding).toContain("momen");
    expect(EVENT_SIGNAGE_COPY.corporate).toContain("tim");
  });
});
