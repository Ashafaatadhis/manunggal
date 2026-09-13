import { test, expect } from "@playwright/test";

const draftSlug = process.env.E2E_DRAFT_SLUG;
const endedSlug = process.env.E2E_ENDED_SLUG;
const foreignEventId = process.env.E2E_FOREIGN_EVENT_ID;

test.describe("access control", () => {
  test("blocks guest upload endpoints for draft events", async ({ request }) => {
    test.skip(!draftSlug, "Set E2E_DRAFT_SLUG to a seeded draft event slug");

    const response = await request.post(`/api/g/${draftSlug}/photos`, {
      data: {
        fileKey: "e2e-file",
        fileUrl: "https://example.com/e2e.jpg",
        fileProvider: "cloudinary",
      },
    });

    expect(response.status()).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: { code: "EVENT_NOT_ACTIVE" },
    });
  });

  test("blocks guest upload endpoints for ended events", async ({ request }) => {
    test.skip(!endedSlug, "Set E2E_ENDED_SLUG to a seeded ended event slug");

    const response = await request.get(`/api/g/${endedSlug}/upload-signature`);

    expect(response.status()).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: { code: "EVENT_ENDED" },
    });
  });

  test("requires authentication for dashboard event details", async ({ request }) => {
    test.skip(
      !foreignEventId || !process.env.E2E_DATABASE,
      "Set E2E_DATABASE=1 and E2E_FOREIGN_EVENT_ID after seeding test database"
    );

    const login = await request.post("/api/auth/login", {
      headers: { "x-forwarded-for": "e2e-authenticated-client" },
      data: {
        email: process.env.E2E_EMAIL,
        password: process.env.E2E_PASSWORD,
      },
    });
    expect(login.ok()).toBeTruthy();

    const response = await request.get(`/api/events/${foreignEventId}`);

    expect(response.status()).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: { code: "EVENT_NOT_FOUND" },
    });
  });
});
