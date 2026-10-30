import { expect, test } from "@playwright/test";

test("adds a todo", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Buy milk");
  await input.press("Enter");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk"]);
  await expect(page.locator(".todo-count")).toHaveText("1 item left");
});

test("does not add a duplicate of an active todo", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Buy milk");
  await input.press("Enter");
  await input.fill("buy milk");
  await input.press("Enter");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk"]);
  await expect(page.getByRole("status")).toHaveText('"Buy milk" is already on your list.');
  await expect(input).toHaveValue("buy milk");

  await page.locator(".todo-list li .toggle").check();
  await input.press("Enter");
  await expect(page.locator(".todo-list li")).toHaveCount(2);
  await expect(page.getByRole("status")).toHaveText("");
});

test("does not rename a todo to the title of another active todo", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  for (const title of ["Buy milk", "Walk the dog"]) {
    await input.fill(title);
    await input.press("Enter");
  }
  const items = page.locator(".todo-list li");

  await items.nth(1).locator("label").dblclick();
  await items.nth(1).locator(".edit").fill("buy milk");
  await items.nth(1).locator(".edit").press("Enter");
  await expect(items).toHaveText(["Buy milk", "Walk the dog"]);
  await expect(page.getByRole("status")).toHaveText('"Buy milk" is already on your list.');

  await items.nth(0).locator(".toggle").check();
  await items.nth(1).locator("label").dblclick();
  await items.nth(1).locator(".edit").fill("Buy milk");
  await items.nth(1).locator(".edit").press("Enter");
  await expect(items).toHaveText(["Buy milk", "Buy milk"]);
  await expect(page.getByRole("status")).toHaveText("");
});
