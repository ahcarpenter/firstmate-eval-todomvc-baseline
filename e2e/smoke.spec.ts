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

test("edits a todo's due date, and overdue follows it", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 30, 12));
  await page.goto("/");
  await page.getByLabel("Due date").fill("2026-11-03");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Pay rent");
  await input.press("Enter");
  const item = page.locator(".todo-list li").first();

  // Enter in the date field saves the title and the date.
  await item.locator("label").dblclick();
  await expect(page.getByLabel("Change date")).toHaveValue("2026-11-03");
  await item.locator(".edit").fill("Pay the rent");
  await page.getByLabel("Change date").fill("2026-10-28");
  await page.getByLabel("Change date").press("Enter");
  await expect(item.locator("label")).toHaveText("Pay the rent");
  await expect(item.locator(".todo-due")).toHaveText("Due Oct 28");
  await expect(item.locator(".todo-overdue")).toHaveText("Overdue");
  await expect(page.locator(".overdue-count")).toHaveText("1 overdue");

  // Escape cancels both fields.
  await item.locator("label").dblclick();
  await item.locator(".edit").fill("Something else");
  await page.getByLabel("Change date").fill("2026-12-01");
  await page.getByLabel("Change date").press("Escape");
  await expect(page.getByLabel("Change date")).toHaveCount(0);
  await expect(item.locator("label")).toHaveText("Pay the rent");
  await expect(item.locator(".todo-due")).toHaveText("Due Oct 28");

  // Enter in the title field saves a future date and clears the overdue mark.
  await item.locator("label").dblclick();
  await page.getByLabel("Change date").fill("2026-11-05");
  await item.locator(".edit").press("Enter");
  await expect(item.locator(".todo-due")).toHaveText("Due Nov 5");
  await expect(item.locator(".todo-overdue")).toHaveCount(0);
  await expect(page.locator(".overdue-count")).toHaveCount(0);

  // Clearing the date removes it, and that survives a reload.
  await item.locator("label").dblclick();
  await page.getByLabel("Change date").fill("");
  await page.getByLabel("Change date").press("Enter");
  await expect(item.locator(".todo-due")).toHaveCount(0);
  await page.reload();
  await expect(item.locator("label")).toHaveText("Pay the rent");
  await expect(item.locator(".todo-due")).toHaveCount(0);
});
