import { expect, test, type Page } from "@playwright/test";
import { addTodos, expectItems, item, newTodo, openApp, toggle } from "../helpers";

test.use({ timezoneId: "America/Los_Angeles" });

async function addWithDue(page: Page, title: string, due: string) {
  await page.getByLabel("Due date").fill(due);
  await newTodo(page).fill(title);
  await newTodo(page).press("Enter");
  await expect(item(page, title)).toHaveCount(1);
}

async function setup(page: Page, now: string) {
  await page.clock.setFixedTime(new Date(now));
  await openApp(page);
  await addWithDue(page, "Late", "2026-11-03");
  await addWithDue(page, "Today", "2026-11-05");
  await addWithDue(page, "Later", "2026-11-10");
  await page.getByLabel("Due date").fill("");
  await addTodos(page, "Undated");
}

// 10:00 on 5 November in Los Angeles.
const MORNING = "2026-11-05T18:00:00Z";

test("marks overdue todos", async ({ page }) => {
  await setup(page, MORNING);
  await expect(item(page, "Late")).toContainText(/overdue/i);
  for (const title of ["Today", "Later", "Undated"]) await expect(item(page, title)).not.toContainText(/overdue/i);
});

test("a completed todo is not overdue", async ({ page }) => {
  await setup(page, MORNING);
  await toggle(page, "Late");
  await expect(item(page, "Late")).not.toContainText(/overdue/i);
});

test("shows only overdue todos on the Overdue filter at /overdue", async ({ page }) => {
  await setup(page, MORNING);
  await page.locator(".filters").getByRole("link", { name: "Overdue" }).click();
  await expect(page).toHaveURL(/\/overdue$/);
  await expectItems(page, ["Late"]);
});

test("opens /overdue directly", async ({ page }) => {
  await setup(page, MORNING);
  await openApp(page, "/overdue");
  await expectItems(page, ["Late"]);
});

test("shows how many todos are overdue in the footer", async ({ page }) => {
  await setup(page, MORNING);
  await expect(page.locator(".footer")).toContainText(/(?<!\d)1 overdue/i);
  await addWithDue(page, "Also late", "2026-11-01");
  await expect(page.locator(".footer")).toContainText(/(?<!\d)2 overdue/i);
});

test("uses the person's own date late in the evening", async ({ page }) => {
  // 23:30 on 4 November in Los Angeles, already 5 November in UTC.
  await page.clock.setFixedTime(new Date("2026-11-05T07:30:00Z"));
  await openApp(page);
  await addWithDue(page, "Due fourth", "2026-11-04");
  await expect(item(page, "Due fourth")).not.toContainText(/overdue/i);
});

test("keeps due dates from the earlier change @edge", async ({ page }) => {
  await setup(page, MORNING);
  await expect(item(page, "Later")).toContainText(/Due\s+Nov\s+10(?!\d)/);
});
