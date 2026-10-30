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

test("changes a todo's due date while editing", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 29, 12, 0));
  await page.goto("/");
  await page.getByLabel("Due date").fill("2026-11-03");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Pay rent");
  await input.press("Enter");
  const item = page.locator(".todo-list li").first();
  const changeDate = page.getByLabel("Change date");

  // Enter in the date field saves both the title and the new date; overdue follows it.
  await item.locator("label").dblclick();
  await expect(changeDate).toHaveValue("2026-11-03");
  await item.locator(".edit").fill("Pay rent now");
  await changeDate.fill("2026-10-01");
  await changeDate.press("Enter");
  await expect(item).toHaveText("Pay rent nowDue Oct 1Overdue");
  await expect(page.locator(".overdue-count")).toHaveText("1 overdue");

  // Escape cancels both fields.
  await item.locator("label").dblclick();
  await item.locator(".edit").fill("Something else");
  await changeDate.fill("2026-12-25");
  await changeDate.press("Escape");
  await expect(item).toHaveText("Pay rent nowDue Oct 1Overdue");

  // Enter in the title field saves the date too.
  await item.locator("label").dblclick();
  await changeDate.fill("2026-12-25");
  await item.locator(".edit").press("Enter");
  await expect(item).toHaveText("Pay rent nowDue Dec 25");
  await expect(page.locator(".overdue-count")).toHaveText("0 overdue");

  // Clearing the date field removes the date, and that survives a reload.
  await item.locator("label").dblclick();
  await changeDate.fill("");
  await changeDate.press("Enter");
  await expect(item).toHaveText("Pay rent now");
  await page.reload();
  await expect(item).toHaveText("Pay rent now");
  await expect(item.locator(".due-date")).toHaveCount(0);
});

test("sorts by due date within every filter and keeps the choice across reloads", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 29, 12, 0));
  await page.goto("/");
  const dueDate = page.getByLabel("Due date");
  const input = page.getByPlaceholder("What needs to be done?");
  for (const [title, due] of [
    ["Buy milk", ""],
    ["Call mom", "2026-11-03"],
    ["Pay rent", "2026-10-28"],
    ["Walk dog", ""],
    ["File taxes", "2026-10-01"],
  ]) {
    if (due) await dueDate.fill(due);
    await input.fill(title);
    await input.press("Enter");
  }
  const items = page.locator(".todo-list li");
  const sort = page.getByLabel("Sort by date");
  await expect(sort).not.toBeChecked();
  await expect(items.locator("label")).toHaveCount(5);
  const order = () => items.evaluateAll((lis) => lis.map((li) => li.querySelector("label")?.firstChild?.textContent));
  await expect.poll(order).toEqual(["Buy milk", "Call mom", "Pay rent", "Walk dog", "File taxes"]);

  await sort.check();
  await expect.poll(order).toEqual(["File taxes", "Pay rent", "Call mom", "Buy milk", "Walk dog"]);

  await page.getByRole("link", { name: "Active" }).click();
  await items.filter({ hasText: "Pay rent" }).locator(".toggle").click();
  await expect.poll(order).toEqual(["File taxes", "Call mom", "Buy milk", "Walk dog"]);

  await page.getByRole("link", { name: "Overdue" }).click();
  await expect.poll(order).toEqual(["File taxes"]);

  await page.reload();
  await expect(sort).toBeChecked();
  await page.getByRole("link", { name: "All" }).click();
  await expect.poll(order).toEqual(["File taxes", "Pay rent", "Call mom", "Buy milk", "Walk dog"]);

  await sort.uncheck();
  await expect.poll(order).toEqual(["Buy milk", "Call mom", "Pay rent", "Walk dog", "File taxes"]);
  await page.reload();
  await expect(sort).not.toBeChecked();
  await expect.poll(order).toEqual(["Buy milk", "Call mom", "Pay rent", "Walk dog", "File taxes"]);
});
