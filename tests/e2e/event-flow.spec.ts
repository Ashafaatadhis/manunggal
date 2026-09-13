import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";

test.describe("event flow", () => {
  test("creates, activates, and exposes an event to guests", async ({ page, request }) => {
    test.skip(
      process.env.E2E_DATABASE !== "1",
      "Set E2E_DATABASE=1 to run the database-backed event flow"
    );

    const clientIp = `e2e-event-${randomUUID()}`;
    const login = await request.post("/api/auth/login", {
      headers: { "x-forwarded-for": clientIp },
      data: {
        email: process.env.E2E_EMAIL,
        password: process.env.E2E_PASSWORD,
      },
    });
    expect(login.ok()).toBeTruthy();

    const slug = `e2e-flow-${randomUUID().slice(0, 8)}`;
    const create = await request.post("/api/events", {
      data: {
        title: "E2E Flow Event",
        slug,
        eventType: "other",
        date: "2030-06-15",
        startTime: "10:00",
        endTime: "18:00",
        venue: "E2E Venue",
        description: "Created by Playwright",
      },
    });
    expect(create.status()).toBe(201);
    const created = (await create.json()) as { data: { id: string } };

    const activate = await request.patch(`/api/events/${created.data.id}`, {
      data: { status: "active" },
    });
    expect(activate.ok()).toBeTruthy();

    const guestPhotos = await request.get(`/api/g/${slug}/photos`);
    expect(guestPhotos.ok()).toBeTruthy();
    await expect(guestPhotos.json()).resolves.toMatchObject({
      success: true,
      data: [],
    });

    const branding = await request.patch(`/api/events/${created.data.id}`, {
      data: {
        branding: {
          qr: { colorPreset: "forest", logoUrl: null },
        },
      },
    });
    expect(branding.ok()).toBeTruthy();

    const detail = await request.get(`/api/events/${created.data.id}`);
    await expect(detail.json()).resolves.toMatchObject({
      success: true,
      data: { status: "active", branding: { qr: { colorPreset: "forest" } } },
    });

    await page.goto(`/g/${slug}`);
    await expect(page.getByText("E2E Flow Event")).toBeVisible();
  });
});
