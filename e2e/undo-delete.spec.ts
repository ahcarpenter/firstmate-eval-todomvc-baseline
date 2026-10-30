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

test("undoes a delete in place and keeps it after reload", async ({ page }) => {
  await page.goto("/");
  await addTodos(page, ["Buy milk", "Walk the dog", "Pay rent"]);
  await destroy(page, "Walk the dog");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk", "Pay rent"]);
  await expect(page.getByRole("status")).toContainText('Deleted "Walk the dog"');

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk", "Walk the dog", "Pay rent"]);
  await expect(page.getByRole("status")).toHaveCount(0);

  await page.reload();
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk", "Walk the dog", "Pay rent"]);
});

test("undoes clearing completed todos", async ({ page }) => {
  await page.goto("/");
  await addTodos(page, ["Buy milk", "Walk the dog", "Pay rent"]);
  await page.locator(".todo-list li").filter({ hasText: "Buy milk" }).locator(".toggle").check();
  await page.locator(".todo-list li").filter({ hasText: "Pay rent" }).locator(".toggle").check();
  await page.getByRole("button", { name: "Clear completed" }).click();
  await expect(page.locator(".todo-list li")).toHaveText(["Walk the dog"]);
  await expect(page.getByRole("status")).toContainText("Deleted 2 todos");

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk", "Walk the dog", "Pay rent"]);
});

test("the undo offer expires after a few seconds", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await addTodos(page, ["Buy milk"]);
  await destroy(page, "Buy milk");
  await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();

  await page.clock.runFor(4000);
  await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();
  await page.clock.runFor(1500);
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect(page.locator(".todo-list li")).toHaveCount(0);
});
