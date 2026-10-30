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

test("edits a todo's due date, and Escape cancels the edit", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 29, 12));
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Pay rent");
  await page.getByLabel("Due date").fill("2026-11-03");
  await input.press("Enter");
  const item = page.locator(".todo-list li").nth(0);
  const changeDate = page.getByLabel("Change date");

  // Enter in the date field saves both fields; an earlier date makes the todo overdue.
  await item.locator("label").dblclick();
  await expect(changeDate).toHaveValue("2026-11-03");
  await item.locator(".edit").fill("Pay the rent");
  await changeDate.fill("2026-10-20");
  await changeDate.press("Enter");
  await expect(item.locator("label")).toHaveText("Pay the rentDue Oct 20Overdue");
  await expect(page.locator(".todo-count .overdue-count")).toHaveText("1 overdue");

  // Escape discards changes to both fields.
  await item.locator("label").dblclick();
  await item.locator(".edit").fill("Ignored");
  await changeDate.fill("2026-12-01");
  await item.locator(".edit").press("Escape");
  await expect(item.locator("label")).toHaveText("Pay the rentDue Oct 20Overdue");

  // Clearing the date removes it, and Enter in the title field saves.
  await item.locator("label").dblclick();
  await expect(changeDate).toHaveValue("2026-10-20");
  await changeDate.fill("");
  await item.locator(".edit").press("Enter");
  await expect(item.locator("label")).toHaveText("Pay the rent");
  await expect(page.locator(".todo-count .overdue-count")).toHaveCount(0);

  await page.reload();
  await expect(item.locator("label")).toHaveText("Pay the rent");
  await expect(item.locator(".due")).toHaveCount(0);
});

test("sorts by due date within every filter, and keeps the choice across reloads", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 29, 12));
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  const due = page.getByLabel("Due date");
  for (const [title, date] of [
    ["Buy milk", ""],
    ["Pay rent", "2026-11-03"],
    ["File taxes", "2026-10-01"],
    ["Call mom", "2026-11-03"],
    ["Walk the dog", ""],
    ["Book flights", "2026-10-30"],
  ]) {
    await input.fill(title);
    if (date) await due.fill(date);
    await input.press("Enter");
  }
  const titles = page.locator(".todo-list li label");
  const sort = page.getByLabel("Sort by date");
  const usual = ["Buy milk", "Pay rent", "File taxes", "Call mom", "Walk the dog", "Book flights"];
  const sorted = ["File taxes", "Book flights", "Pay rent", "Call mom", "Buy milk", "Walk the dog"];
  const titlesOf = async () => (await titles.allTextContents()).map((text) => text.replace(/Due.*$/, ""));

  await expect(sort).not.toBeChecked();
  expect(await titlesOf()).toEqual(usual);

  await sort.check();
  await expect.poll(titlesOf).toEqual(sorted);
  await page.reload();
  await expect(sort).toBeChecked();
  await expect.poll(titlesOf).toEqual(sorted);

  // Sorting applies within each filter.
  await page.locator(".todo-list li", { hasText: "Pay rent" }).locator(".toggle").click();
  await page.locator(".todo-list li", { hasText: "Buy milk" }).locator(".toggle").click();
  await page.getByRole("link", { name: "Active" }).click();
  await expect.poll(titlesOf).toEqual(["File taxes", "Book flights", "Call mom", "Walk the dog"]);
  await page.getByRole("link", { name: "Completed" }).click();
  await expect.poll(titlesOf).toEqual(["Pay rent", "Buy milk"]);

  await sort.uncheck();
  await expect.poll(titlesOf).toEqual(["Buy milk", "Pay rent"]);
  await page.reload();
  await expect(sort).not.toBeChecked();
  await expect.poll(titlesOf).toEqual(["Buy milk", "Pay rent"]);
});

test("labels todos due today or tomorrow by the local calendar", async ({ page }) => {
  // Late in the local evening, when the UTC day may already be the next one.
  await page.clock.setFixedTime(new Date(2026, 9, 29, 23, 30));
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  const due = page.getByLabel("Due date");
  for (const [title, date] of [["Pay rent", "2026-10-29"], ["Buy milk", "2026-10-30"], ["File taxes", "2026-10-31"]]) {
    await input.fill(title);
    await due.fill(date);
    await input.press("Enter");
  }
  const dues = page.locator(".todo-list li .due");
  await expect(dues).toHaveText(["Due today", "Due tomorrow", "Due Oct 31"]);
  await expect(page.locator(".todo-list li .overdue")).toHaveCount(0);
});
