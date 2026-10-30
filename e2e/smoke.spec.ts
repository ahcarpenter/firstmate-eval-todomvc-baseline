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
  await page.goto("/");
  await page.getByLabel("Due date").fill("2026-11-03");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Pay rent");
  await input.press("Enter");
  await input.fill("Buy milk");
  await input.press("Enter");
  const items = page.locator(".todo-list li");
  await expect(items).toHaveText(["Pay rentDue Nov 3", "Buy milk"]);
  await expect(page.getByLabel("Due date")).toHaveValue("");

  await page.reload();
  await expect(items.first().locator(".due-date")).toHaveText("Due Nov 3");
  await expect(items.nth(1).locator(".due-date")).toHaveCount(0);
});

test("marks overdue todos, filters them, and counts them in the footer", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 29, 12, 0));
  await page.goto("/");
  const dueDate = page.getByLabel("Due date");
  const input = page.getByPlaceholder("What needs to be done?");
  for (const [title, due] of [
    ["Pay rent", "2026-10-28"],
    ["File taxes", "2026-10-01"],
    ["Call mom", "2026-10-29"],
    ["Buy milk", ""],
  ]) {
    if (due) await dueDate.fill(due);
    await input.fill(title);
    await input.press("Enter");
  }
  const items = page.locator(".todo-list li");
  await expect(items.locator(".overdue")).toHaveCount(2);
  await expect(items.first().locator(".overdue")).toHaveText("Overdue");
  await expect(page.locator(".overdue-count")).toHaveText("2 overdue");

  await items.nth(1).locator(".toggle").check();
  await expect(items.nth(1).locator(".overdue")).toHaveCount(0);
  await expect(page.locator(".overdue-count")).toHaveText("1 overdue");

  await page.getByRole("link", { name: "Overdue" }).click();
  await expect(page).toHaveURL(/\/overdue$/);
  await expect(items).toHaveText(["Pay rentDue Oct 28Overdue"]);
  await expect(page.getByRole("link", { name: "Overdue" })).toHaveClass("selected");

  await page.reload();
  await expect(items).toHaveText(["Pay rentDue Oct 28Overdue"]);
});
