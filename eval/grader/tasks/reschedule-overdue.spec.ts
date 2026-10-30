import { expect, test, type Page } from "@playwright/test";
import { item, openApp, toggle } from "../helpers";
import { addWithDue, datedSetup } from "../chain-helpers";

test.use({ timezoneId: "America/Los_Angeles" });

const move = (page: Page) => page.getByRole("button", { name: /move overdue to today/i });
const today = /Due\s+(today|Nov\s+5(?!\d))/i;

test.beforeEach(async ({ page }) => {
  await datedSetup(page);
  await addWithDue(page, "Very late", "2026-11-01");
  await addWithDue(page, "Done late", "2026-11-02");
  await toggle(page, "Done late");
});

test("offers the button while something is overdue", async ({ page }) => {
  await expect(move(page)).toBeVisible();
});

test("moves every overdue todo to today", async ({ page }) => {
  await move(page).click();
  for (const title of ["Late", "Very late"]) {
    await expect(item(page, title)).toContainText(today);
    await expect(item(page, title)).not.toContainText(/overdue/i);
  }
  await expect(page.locator(".footer")).not.toContainText(/(?<!\d)[1-9]\d* overdue/i);
});

test("leaves completed and not-yet-due todos alone", async ({ page }) => {
  await move(page).click();
  await expect(item(page, "Done late")).toContainText(/Due\s+Nov\s+2(?!\d)/);
  await expect(item(page, "Later")).toContainText(/Due\s+Nov\s+10(?!\d)/);
  await expect(item(page, "Undated")).not.toContainText(/Due/);
});

test("hides the button once nothing is overdue", async ({ page }) => {
  await move(page).click();
  await expect(move(page)).toHaveCount(0);
});

test("the new dates are kept across a reload", async ({ page }) => {
  await move(page).click();
  await expect(item(page, "Late")).toContainText(today);
  await page.reload();
  await openApp(page);
  await expect(item(page, "Late")).toContainText(today);
  await expect(item(page, "Very late")).not.toContainText(/overdue/i);
});
