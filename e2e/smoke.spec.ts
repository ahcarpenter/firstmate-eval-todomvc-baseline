import { expect, test } from "@playwright/test";

test("adds a todo", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Buy milk");
  await input.press("Enter");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk"]);
  await expect(page.locator(".todo-count")).toHaveText("1 item left");
});

test("adds a todo with a due date that survives a reload", async ({ page }) => {
  // Pin today before the due date so the todo is not overdue whenever the suite runs.
  await page.clock.setFixedTime(new Date(2026, 9, 29, 12));
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Pay rent");
  await page.getByLabel("Due date").fill("2026-11-03");
  await input.press("Enter");
  await input.fill("Buy milk");
  await input.press("Enter");
  const items = page.locator(".todo-list li");
  await expect(items).toHaveText(["Pay rentDue Nov 3", "Buy milk"]);
  await expect(page.getByLabel("Due date")).toHaveValue("");
  await page.reload();
  await expect(items.nth(0).locator(".due")).toHaveText("Due Nov 3");
  await expect(items.nth(1).locator(".due")).toHaveCount(0);
});

test("marks overdue todos, counts them, and filters them at /overdue", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 29, 12));
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  const due = page.getByLabel("Due date");
  for (const [title, date] of [
    ["Pay rent", "2026-10-28"],
    ["File taxes", "2026-10-01"],
    ["Call mom", "2026-10-29"],
    ["Buy milk", ""],
  ]) {
    await input.fill(title);
    if (date) await due.fill(date);
    await input.press("Enter");
  }
  const items = page.locator(".todo-list li");
  await expect(items.locator(".overdue")).toHaveCount(2);
  await expect(items.nth(0).locator(".overdue")).toHaveText("Overdue");
  await expect(items.nth(2).locator(".overdue")).toHaveCount(0);
  await expect(page.locator(".todo-count .overdue-count")).toHaveText("2 overdue");

  await page.getByRole("link", { name: "Overdue" }).click();
  await expect(page).toHaveURL(/\/overdue$/);
  await expect(page.getByRole("link", { name: "Overdue" })).toHaveClass("selected");
  await expect(items.locator("label")).toHaveText(["Pay rentDue Oct 28Overdue", "File taxesDue Oct 1Overdue"]);

  await items.nth(1).locator(".toggle").click();
  await expect(items.locator("label")).toHaveText(["Pay rentDue Oct 28Overdue"]);
  await expect(page.locator(".todo-count .overdue-count")).toHaveText("1 overdue");

  await page.reload();
  await expect(items).toHaveCount(1);
  await items.nth(0).locator(".toggle").click();
  await expect(items).toHaveCount(0);
  await expect(page.locator(".todo-count .overdue-count")).toHaveCount(0);
});

test("snoozes an overdue todo to tomorrow", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 31, 12));
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  const due = page.getByLabel("Due date");
  for (const [title, date] of [
    ["Pay rent", "2026-10-28"],
    ["Call mom", "2026-11-03"],
  ]) {
    await input.fill(title);
    await due.fill(date);
    await input.press("Enter");
  }
  const items = page.locator(".todo-list li");
  await expect(items.nth(1).getByRole("button", { name: "Snooze" })).toHaveCount(0);

  await items.nth(0).getByRole("button", { name: "Snooze" }).click();
  await expect(items.locator("label")).toHaveText(["Pay rentDue Nov 1", "Call momDue Nov 3"]);
  await expect(page.getByRole("button", { name: "Snooze" })).toHaveCount(0);
  await expect(page.locator(".todo-count .overdue-count")).toHaveCount(0);

  await page.reload();
  await expect(items.nth(0).locator(".due")).toHaveText("Due Nov 1");
});
