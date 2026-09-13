import { test, expect } from "@playwright/test";

test.describe("authentication", () => {
  test("redirects unauthenticated users from dashboard to login", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText("Masuk", { exact: true }).first()).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("shows safe error for invalid credentials", async ({ page }) => {
    test.skip(
      !process.env.E2E_DATABASE,
      "Set E2E_DATABASE=1 after seeding test database to run database-backed login test"
    );

    await page.goto("/login");
    await page.getByLabel("Email").fill("unknown@example.com");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Masuk" }).click();

    await expect(page.getByText("Email atau password salah")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
