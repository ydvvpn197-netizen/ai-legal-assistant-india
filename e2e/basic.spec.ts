import { test, expect } from "@playwright/test";

test("landing renders", async ({ page }) => {
	await page.goto("/");
	await expect(page.locator("h1")).toContainText("AI Legal Assistant");
});
