import { expect, test } from "@playwright/test";
import { item, openApp } from "../helpers";
import { addWithDue, datedSetup } from "../chain-helpers";

test.use({ timezoneId: "America/Los_Angeles" });

test.beforeEach(async ({ page }) => {
  await datedSetup(page);
  await addWithDue(page, "Tomorrow", "2026-11-06");
});

test("a todo due today says Due today", async ({ page }) => {
  await expect(item(page, "Today")).toContainText(/Due\s+today/i);
  await expect(item(page, "Today")).not.toContainText(/Nov/);
});

test("a todo due tomorrow says Due tomorrow", async ({ page }) => {
  await expect(item(page, "Tomorrow")).toContainText(/Due\s+tomorrow/i);
  await expect(item(page, "Tomorrow")).not.toContainText(/Nov/);
});

test("other dates keep the usual form", async ({ page }) => {
  await expect(item(page, "Later")).toContainText(/Due\s+Nov\s+10(?!\d)/);
  await expect(item(page, "Late")).toContainText(/Due\s+Nov\s+3(?!\d)/);
  await expect(item(page, "Late")).not.toContainText(/today|tomorrow/i);
});

test("today follows the person's own calendar late in the evening", async ({ page }) => {
  // 23:30 on 4 November in Los Angeles, already 5 November in UTC.
  await page.clock.setFixedTime(new Date("2026-11-05T07:30:00Z"));
  await page.reload();
  await openApp(page);
  await expect(item(page, "Today")).toContainText(/Due\s+tomorrow/i);
  await expect(item(page, "Tomorrow")).toContainText(/Due\s+Nov\s+6(?!\d)/);
});

test("the wording is kept across a reload", async ({ page }) => {
  await page.reload();
  await openApp(page);
  await expect(item(page, "Today")).toContainText(/Due\s+today/i);
  await expect(item(page, "Tomorrow")).toContainText(/Due\s+tomorrow/i);
});
