import { expect, test } from "@playwright/test";

test("adds a todo", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Buy milk");
  await input.press("Enter");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk"]);
  await expect(page.locator(".todo-count")).toHaveText("1 item left");
});

test("duplicates a todo below the original and keeps it after a reload", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  for (const title of ["Buy milk", "Walk the dog"]) {
    await input.fill(title);
    await input.press("Enter");
  }
  const items = page.locator(".todo-list li");
  await items.first().locator(".toggle").check();
  await items.first().hover();
  await items.first().getByRole("button", { name: "Duplicate" }).click();
  await expect(items).toHaveText(["Buy milk", "Buy milk", "Walk the dog"]);
  await expect(items.nth(1)).not.toHaveClass(/completed/);

  // The copy is its own todo: toggling it leaves the original alone.
  await items.nth(1).locator(".toggle").check();
  await expect(items.first().locator(".toggle")).toBeChecked();
  await items.nth(1).locator(".toggle").uncheck();
  await expect(items.first().locator(".toggle")).toBeChecked();

  await page.reload();
  await expect(items).toHaveText(["Buy milk", "Buy milk", "Walk the dog"]);
  await expect(page.locator(".todo-count")).toHaveText("2 items left");
});
