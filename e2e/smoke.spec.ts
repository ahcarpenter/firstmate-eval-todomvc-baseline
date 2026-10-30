import { expect, test } from "@playwright/test";

test("adds a todo", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Buy milk");
  await input.press("Enter");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk"]);
  await expect(page.locator(".todo-count")).toHaveText("1 item left");
});

test("does not add a duplicate active todo", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Buy milk");
  await input.press("Enter");
  await input.fill("buy milk");
  await input.press("Enter");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk"]);
  await expect(page.getByRole("status")).toHaveText("\u201cBuy milk\u201d is already on your list.");
  await expect(input).toHaveValue("buy milk");

  await input.fill("Walk the dog");
  await expect(page.getByRole("status")).toHaveCount(0);

  await page.locator(".todo-list li .toggle").first().check();
  await input.fill("Buy milk");
  await input.press("Enter");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk", "Buy milk"]);
});

test("does not rename a todo to a duplicate active title", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  for (const title of ["Buy milk", "Walk the dog", "Call mom"]) {
    await input.fill(title);
    await input.press("Enter");
  }
  const items = page.locator(".todo-list li");

  await items.nth(1).locator("label").dblclick();
  await items.nth(1).locator(".edit").fill("buy milk");
  await items.nth(1).locator(".edit").press("Enter");
  await expect(items).toHaveText(["Buy milk", "Walk the dog", "Call mom"]);
  await expect(page.getByRole("status")).toHaveText("\u201cBuy milk\u201d is already on your list.");

  await items.nth(2).locator(".toggle").check();
  await items.nth(1).locator("label").dblclick();
  await expect(page.getByRole("status")).toHaveCount(0);
  await items.nth(1).locator(".edit").fill("Call mom");
  await items.nth(1).locator(".edit").press("Enter");
  await expect(items).toHaveText(["Buy milk", "Call mom", "Call mom"]);
});
