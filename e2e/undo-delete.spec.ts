import { expect, test, type Page } from "@playwright/test";

async function addTodos(page: Page, titles: string[]) {
  const input = page.getByPlaceholder("What needs to be done?");
  for (const title of titles) {
    await input.fill(title);
    await input.press("Enter");
  }
}

async function destroy(page: Page, title: string) {
  const item = page.locator(".todo-list li").filter({ hasText: title });
  await item.hover();
  await item.locator(".destroy").click();
}

test("undoes a delete and restores the todo in place", async ({ page }) => {
  await page.goto("/");
  await addTodos(page, ["Buy milk", "Walk the dog", "Pay rent"]);
  await destroy(page, "Walk the dog");

  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk", "Pay rent"]);
  await expect(page.getByRole("status")).toContainText("Deleted “Walk the dog”");

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk", "Walk the dog", "Pay rent"]);
  await expect(page.getByRole("status")).toHaveCount(0);

  await page.reload();
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk", "Walk the dog", "Pay rent"]);
});

test("undoes deleting the last todo", async ({ page }) => {
  await page.goto("/");
  await addTodos(page, ["Buy milk"]);
  await destroy(page, "Buy milk");
  await expect(page.locator(".todo-list li")).toHaveCount(0);

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk"]);
});

test("keeps ids unique when a todo is added before undoing", async ({ page }) => {
  await page.goto("/");
  await addTodos(page, ["Buy milk", "Walk the dog"]);
  await destroy(page, "Walk the dog");
  await addTodos(page, ["Pay rent"]);
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk", "Walk the dog", "Pay rent"]);

  // Toggling one must not toggle a todo that shares its id.
  await page.locator(".todo-list li").filter({ hasText: "Pay rent" }).locator(".toggle").check();
  await expect(page.locator(".todo-count")).toHaveText("2 items left");
});

test("makes the delete permanent after a few seconds", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await addTodos(page, ["Buy milk"]);
  await destroy(page, "Buy milk");
  await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();

  await page.clock.runFor(5000);
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect(page.locator(".todo-list li")).toHaveCount(0);
});
