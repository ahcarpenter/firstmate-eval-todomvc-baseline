import { expect, test } from "@playwright/test";

test("adds a todo", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Buy milk");
  await input.press("Enter");
  await expect(page.locator(".todo-list li label")).toHaveText(["Buy milk"]);
  await expect(page.locator(".todo-count")).toHaveText("1 item left");
});

test("pins todos to the top across reloads and filters", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  for (const title of ["One", "Two", "Three"]) {
    await input.fill(title);
    await input.press("Enter");
  }
  const items = page.locator(".todo-list li");
  const labels = page.locator(".todo-list li label");

  await items.filter({ hasText: "Three" }).getByRole("button", { name: "Pin" }).click();
  await items.filter({ hasText: "Two" }).getByRole("button", { name: "Pin" }).click();
  await expect(labels).toHaveText(["Two", "Three", "One"]);
  await expect(items.filter({ hasText: "Two" }).getByRole("button", { name: "Unpin" })).toBeVisible();

  await page.reload();
  await expect(labels).toHaveText(["Two", "Three", "One"]);

  await items.filter({ hasText: "Three" }).locator(".toggle").check();
  await page.getByRole("link", { name: "Active" }).click();
  await expect(labels).toHaveText(["Two", "One"]);
  await page.getByRole("link", { name: "Completed" }).click();
  await expect(labels).toHaveText(["Three"]);

  await page.getByRole("link", { name: "All" }).click();
  await items.filter({ hasText: "Two" }).getByRole("button", { name: "Unpin" }).click();
  await expect(labels).toHaveText(["Three", "One", "Two"]);
});
