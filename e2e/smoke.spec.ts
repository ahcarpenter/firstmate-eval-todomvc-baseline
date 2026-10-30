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
  await expect(page.locator(".todo-list li .todo-due")).toHaveText(["Due Nov 3"]);
  await expect(page.getByLabel("Due date")).toHaveValue("");
  await page.reload();
  await expect(page.locator(".todo-list li").first().locator(".todo-due")).toHaveText("Due Nov 3");
  await expect(page.locator(".todo-list li").nth(1).locator(".todo-due")).toHaveCount(0);
});

test("marks overdue todos, filters them, and counts them", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 30, 12));
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  const due = page.getByLabel("Due date");
  for (const [title, date] of [
    ["Pay rent", "2026-10-28"],
    ["File taxes", "2026-10-29"],
    ["Call mom", "2026-10-30"],
    ["Book trip", "2026-11-03"],
    ["Buy milk", ""],
  ]) {
    if (date) await due.fill(date);
    await input.fill(title);
    await input.press("Enter");
  }
  const items = page.locator(".todo-list li");
  await expect(items.locator(".todo-overdue")).toHaveText(["Overdue", "Overdue"]);
  await expect(items.filter({ has: page.locator(".todo-overdue") }).locator("label")).toHaveText(["Pay rent", "File taxes"]);
  await expect(page.locator(".overdue-count")).toHaveText("2 overdue");

  await page.getByRole("link", { name: "Overdue" }).click();
  await expect(page).toHaveURL(/\/overdue$/);
  await expect(page.getByRole("link", { name: "Overdue" })).toHaveClass("selected");
  await expect(items.locator("label")).toHaveText(["Pay rent", "File taxes"]);

  await items.first().locator(".toggle").click();
  await expect(items.locator("label")).toHaveText(["File taxes"]);
  await expect(page.locator(".overdue-count")).toHaveText("1 overdue");

  await page.reload();
  await expect(items.locator("label")).toHaveText(["File taxes"]);
});
