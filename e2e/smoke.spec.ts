import { expect, test } from "@playwright/test";

test("adds a todo", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Buy milk");
  await input.press("Enter");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk"]);
  await expect(page.locator(".todo-count")).toHaveText("1 item left · 0 completed");
});

test("shows how many todos are completed", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  for (const title of ["Buy milk", "Walk the dog", "Read a book"]) {
    await input.fill(title);
    await input.press("Enter");
  }
  await page.locator(".todo-list li .toggle").first().check();
  await page.locator(".todo-list li .toggle").nth(1).check();
  await expect(page.locator(".todo-count")).toHaveText("1 item left · 2 completed");
});
