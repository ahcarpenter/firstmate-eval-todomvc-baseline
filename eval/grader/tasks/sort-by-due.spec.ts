import { expect, test, type Page } from "@playwright/test";
import { openApp, toggle } from "../helpers";
import { addWithDue, datedSetup, expectOrder } from "../chain-helpers";

test.use({ timezoneId: "America/Los_Angeles" });

const sort = (page: Page) => page.getByLabel("Sort by date", { exact: true });

test.beforeEach(async ({ page }) => {
  await datedSetup(page);
});

test("unsorted, todos keep their usual order", async ({ page }) => {
  await expect(sort(page)).not.toBeChecked();
  await expectOrder(page, ["Later", "Undated", "Late", "Today"]);
});

test("sorted, the earliest due date comes first and undated todos last", async ({ page }) => {
  await sort(page).check();
  await expectOrder(page, ["Late", "Today", "Later", "Undated"]);
});

test("unchecking goes back to the usual order", async ({ page }) => {
  await sort(page).check();
  await expectOrder(page, ["Late", "Today", "Later", "Undated"]);
  await sort(page).uncheck();
  await expectOrder(page, ["Later", "Undated", "Late", "Today"]);
});

test("todos due the same day keep their usual order", async ({ page }) => {
  await addWithDue(page, "Also today", "2026-11-05");
  await sort(page).check();
  await expectOrder(page, ["Late", "Today", "Also today", "Later", "Undated"]);
});

test("the choice is kept across a reload", async ({ page }) => {
  await sort(page).check();
  await page.reload();
  await openApp(page);
  await expect(sort(page)).toBeChecked();
  await expectOrder(page, ["Late", "Today", "Later", "Undated"]);
});

test("sorting applies within a filter", async ({ page }) => {
  await toggle(page, "Today");
  await sort(page).check();
  await page.locator(".filters").getByRole("link", { name: "Active" }).click();
  await expectOrder(page, ["Late", "Later", "Undated"]);
});
