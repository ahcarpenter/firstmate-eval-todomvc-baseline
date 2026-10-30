import { expect, test } from "@playwright/test";

test("adds a todo", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Buy milk");
  await input.press("Enter");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk"]);
  await expect(page.locator(".todo-count")).toHaveText("1 item left");
});

test("keeps todos distinct after a delete", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  for (const title of ["One", "Two", "Three"]) {
    await input.fill(title);
    await input.press("Enter");
  }
  const items = page.locator(".todo-list li");
  await items.filter({ hasText: "One" }).hover();
  await items.filter({ hasText: "One" }).locator(".destroy").click();
  await input.fill("Four");
  await input.press("Enter");
  await expect(items).toHaveText(["Two", "Three", "Four"]);

  await items.filter({ hasText: "Three" }).locator(".toggle").check();
  await expect(page.locator(".todo-list li.completed")).toHaveText(["Three"]);

  await items.filter({ hasText: "Four" }).hover();
  await items.filter({ hasText: "Four" }).locator(".destroy").click();
  await expect(items).toHaveText(["Two", "Three"]);
});

test("duplicates a todo right below it and keeps the copy after a reload", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  for (const title of ["One", "Two"]) {
    await input.fill(title);
    await input.press("Enter");
  }
  const items = page.locator(".todo-list li");
  await items.filter({ hasText: "One" }).locator(".toggle").check();
  await items.filter({ hasText: "One" }).hover();
  await items.filter({ hasText: "One" }).getByRole("button", { name: "Duplicate" }).click();
  await expect(items).toHaveText(["One", "One", "Two"]);
  await expect(items.nth(0)).toHaveClass(/completed/);
  await expect(items.nth(1)).not.toHaveClass(/completed/);

  await page.reload();
  await expect(items).toHaveText(["One", "One", "Two"]);

  // The copy is its own todo: toggling and deleting it leaves the original alone.
  await items.nth(1).locator(".toggle").check();
  await expect(page.locator(".todo-list li.completed")).toHaveCount(2);
  await items.nth(1).hover();
  await items.nth(1).locator(".destroy").click();
  await expect(items).toHaveText(["One", "Two"]);
  await expect(items.nth(0)).toHaveClass(/completed/);
});
