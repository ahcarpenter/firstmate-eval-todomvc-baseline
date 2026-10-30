import { expect, test, type Page } from "@playwright/test";

const titles = ["Buy milk", "Walk the dog", "Pay rent", "Call mum"];

async function addTodos(page: Page, newTitles: string[]) {
  const input = page.getByPlaceholder("What needs to be done?");
  for (const title of newTitles) {
    await input.fill(title);
    await input.press("Enter");
  }
}

async function complete(page: Page, title: string) {
  await page.locator(".todo-list li").filter({ hasText: title }).locator(".toggle").check();
}

async function seed(page: Page) {
  await addTodos(page, titles);
  await complete(page, "Buy milk");
  await complete(page, "Pay rent");
}

async function clearCompleted(page: Page) {
  await page.getByRole("button", { name: "Clear completed" }).click();
}

test("undoes clearing and restores every todo in place and completed", async ({ page }) => {
  await page.goto("/");
  await seed(page);
  await clearCompleted(page);

  await expect(page.locator(".todo-list li")).toHaveText(["Walk the dog", "Call mum"]);
  await expect(page.getByRole("status")).toContainText("Deleted 2 todos");

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.locator(".todo-list li")).toHaveText(titles);
  await expect(page.locator(".todo-list li.completed")).toHaveText(["Buy milk", "Pay rent"]);
  await expect(page.locator(".todo-count")).toHaveText("2 items left");
  await expect(page.getByRole("status")).toHaveCount(0);

  await page.reload();
  await expect(page.locator(".todo-list li")).toHaveText(titles);
  await expect(page.locator(".todo-list li.completed")).toHaveText(["Buy milk", "Pay rent"]);
});

test("undoes clearing from the completed filter when nothing else is left", async ({ page }) => {
  await page.goto("/");
  await addTodos(page, ["Buy milk", "Walk the dog"]);
  await page.locator(".toggle-all").check();
  await page.getByRole("link", { name: "Completed" }).click();
  await expect(page).toHaveURL(/\/completed$/);
  await clearCompleted(page);
  await expect(page.locator(".todo-list li")).toHaveCount(0);

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.locator(".todo-list li.completed")).toHaveText(["Buy milk", "Walk the dog"]);
});

test("names the todo when only one was cleared", async ({ page }) => {
  await page.goto("/");
  await addTodos(page, ["Buy milk", "Walk the dog"]);
  await complete(page, "Walk the dog");
  await clearCompleted(page);
  await expect(page.getByRole("status")).toContainText("Deleted “Walk the dog”");
});

test("keeps ids unique when a todo is added before undoing a clear", async ({ page }) => {
  await page.goto("/");
  await seed(page);
  await clearCompleted(page);
  await addTodos(page, ["Water plants"]);
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.locator(".todo-list li")).toHaveText([...titles, "Water plants"]);

  // Toggling one must not toggle a todo that shares its id.
  await complete(page, "Water plants");
  await expect(page.locator(".todo-count")).toHaveText("2 items left");
  await expect(page.locator(".todo-list li.completed")).toHaveText(["Buy milk", "Pay rent", "Water plants"]);
});

test("makes the clear permanent after a few seconds", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await seed(page);
  await clearCompleted(page);
  await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();

  await page.clock.runFor(5000);
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect(page.locator(".todo-list li")).toHaveText(["Walk the dog", "Call mum"]);
});
