import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";

test.describe("live slideshow", () => {
  test("shows approved photos and receives host controls in realtime", async ({
    page,
    request,
  }) => {
    test.skip(
      process.env.E2E_DATABASE !== "1",
      "Set E2E_DATABASE=1 to run the database-backed live slideshow flow"
    );

    const clientIp = `e2e-live-${randomUUID()}`;
    const login = await request.post("/api/auth/login", {
      headers: { "x-forwarded-for": clientIp },
      data: {
        email: process.env.E2E_EMAIL,
        password: process.env.E2E_PASSWORD,
      },
    });
    expect(login.ok()).toBeTruthy();

    const slug = `e2e-live-${randomUUID().slice(0, 8)}`;
    const create = await request.post("/api/events", {
      data: {
        title: "E2E Live Slideshow",
        slug,
        eventType: "other",
        date: "2030-06-15",
        startTime: "10:00",
        endTime: "18:00",
        venue: "E2E Live Venue",
        description: "Created by Playwright",
      },
    });
    expect(create.status()).toBe(201);
    const created = (await create.json()) as { data: { id: string } };

    const activate = await request.patch(`/api/events/${created.data.id}`, {
      data: { status: "active" },
    });
    expect(activate.ok()).toBeTruthy();

    const photoIds: string[] = [];
    for (const [guestName, message] of [
      ["Tamu Satu", "Pesan foto pertama"],
      ["Tamu Dua", "Pesan foto kedua"],
    ]) {
      const upload = await request.post(`/api/g/${slug}/photos`, {
        data: {
          fileKey: `e2e/${randomUUID()}.jpg`,
          fileUrl: "https://images.example.com/e2e-photo.jpg",
          thumbnailUrl: "https://images.example.com/e2e-photo-thumb.jpg",
          fileProvider: "local",
          guestName,
          message,
        },
      });
      expect(upload.status()).toBe(201);
      const uploaded = (await upload.json()) as { data: { id: string } };
      photoIds.push(uploaded.data.id);
    }

    for (const photoId of photoIds) {
      const moderation = await request.patch(`/api/photos/${photoId}/status`, {
        data: { status: "approved" },
      });
      expect(moderation.ok()).toBeTruthy();
    }

    await page.goto(`/live/${slug}`);
    await expect(page.getByText("E2E Live Slideshow")).toBeVisible();
    await expect(page.getByText("Live")).toBeVisible();
    await expect(page.getByText("Pesan foto kedua")).toBeVisible();

    const pause = await request.post(
      `/api/events/${created.data.id}/slideshow/control`,
      { data: { type: "pause" } }
    );
    expect(pause.ok()).toBeTruthy();
    await expect(page.getByRole("button", { name: "Putar" })).toBeVisible();

    const next = await request.post(
      `/api/events/${created.data.id}/slideshow/control`,
      { data: { type: "next" } }
    );
    expect(next.ok()).toBeTruthy();
    await expect(page.getByText("Pesan foto pertama")).toBeVisible();

    const resume = await request.post(
      `/api/events/${created.data.id}/slideshow/control`,
      { data: { type: "resume" } }
    );
    expect(resume.ok()).toBeTruthy();
    await expect(page.getByRole("button", { name: "Jeda" })).toBeVisible();
  });
});
