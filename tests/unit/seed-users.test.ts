import { describe, expect, it } from "vitest";
import { SEED_PASSWORD, SEED_USERS } from "@/lib/seed-users";

describe("seed users", () => {
  it("defines one user for every application role", () => {
    expect(SEED_USERS.map((user) => user.role)).toEqual(["host", "vendor", "admin"]);
  });

  it("uses unique local development emails and non-empty password", () => {
    const emails = SEED_USERS.map((user) => user.email);
    expect(new Set(emails).size).toBe(SEED_USERS.length);
    expect(emails.every((email) => email.endsWith("@manunggal.local"))).toBe(true);
    expect(SEED_PASSWORD.length).toBeGreaterThanOrEqual(8);
  });
});
