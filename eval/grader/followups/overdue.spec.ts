import { expect, test, type Page } from "@playwright/test";
import { addTodos, item, newTodo, openApp } from "../helpers";

test.use({ timezoneId: "America/Los_Angeles" });

async function addWithDue(page: Page, title: string, due: string) {
  await page.getByLabel("Due date").fill(due);
  await newTodo(page).fill(title);
  await newTodo(page).press("Enter");
  await expect(item(page, title)).toHaveCount(1);
}
const snooze = (page: Page, title: string) => item(page, title).getByRole("button", { name: /snooze/i });

// 10:00 on 5 November in Los Angeles.
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-05T18:00:00Z"));
  await openApp(page);
  await addWithDue(page, "Late", "2026-11-03");
  await addWithDue(page, "Today", "2026-11-05");
  await addWithDue(page, "Later", "2026-11-10");
  await page.getByLabel("Due date").fill("");
  await addTodos(page, "Undated");
});

test("only overdue todos offer Snooze", async ({ page }) => {
  await item(page, "Late").hover();
  await expect(snooze(page, "Late")).toHaveCount(1);
  for (const title of ["Today", "Later", "Undated"]) {
    await item(page, title).hover();
    await expect(snooze(page, title)).toHaveCount(0);
  }
});

test("snoozing moves the due date to tomorrow", async ({ page }) => {
  await item(page, "Late").hover();
  await snooze(page, "Late").click();
  await expect(item(page, "Late")).toContainText(/due nov 6/i);
  await expect(item(page, "Late")).not.toContainText(/overdue/i);
});

test("a snoozed todo leaves the Overdue filter and count", async ({ page }) => {
  await item(page, "Late").hover();
  await snooze(page, "Late").click();
  await expect(page.locator(".footer")).not.toContainText(/(?<!\d)[1-9]\d* overdue/i);
  await openApp(page, "/overdue");
  await expect(page.locator(".todo-list li")).toHaveCount(0);
});

test("the new date is kept across a reload", async ({ page }) => {
  await item(page, "Late").hover();
  await snooze(page, "Late").click();
  await expect(item(page, "Late")).toContainText(/due nov 6/i);
  await page.reload();
  await openApp(page);
  await expect(item(page, "Late")).toContainText(/due nov 6/i);
  await expect(item(page, "Late")).not.toContainText(/overdue/i);
});
