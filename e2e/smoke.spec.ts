import { expect, test } from "@playwright/test";

test("adds a todo", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Buy milk");
  await input.press("Enter");
  await expect(page.locator(".todo-list li label")).toHaveText(["Buy milk"]);
  await expect(page.locator(".todo-count")).toHaveText("1 item left");
});

test("pins a todo above the others across reloads and filters", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  for (const title of ["Buy milk", "Walk the dog", "Read a book"]) {
    await input.fill(title);
    await input.press("Enter");
  }
  const items = page.locator(".todo-list li");
  await items.filter({ hasText: "Read a book" }).getByRole("button", { name: "Pin" }).click();
  await items.filter({ hasText: "Walk the dog" }).locator(".toggle").check();
  await expect(items.locator("label")).toHaveText(["Read a book", "Buy milk", "Walk the dog"]);
  await expect(items.first().getByRole("button", { name: "Unpin" })).toBeVisible();

  await page.reload();
  await expect(items.locator("label")).toHaveText(["Read a book", "Buy milk", "Walk the dog"]);

  await page.getByRole("link", { name: "Active" }).click();
  await expect(items.locator("label")).toHaveText(["Read a book", "Buy milk"]);
  await page.getByRole("link", { name: "Completed" }).click();
  await expect(items.locator("label")).toHaveText(["Walk the dog"]);

  await page.getByRole("link", { name: "All" }).click();
  await items.first().getByRole("button", { name: "Unpin" }).click();
  await expect(items.locator("label")).toHaveText(["Buy milk", "Walk the dog", "Read a book"]);
});
