import { expect, test } from "@playwright/test";

test("adds a todo", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Buy milk");
  await input.press("Enter");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk"]);
  await expect(page.locator(".todo-count")).toHaveText("1 item left");
});

test("toggling and deleting after a delete affect only one todo", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  for (const title of ["A", "B", "C"]) {
    await input.fill(title);
    await input.press("Enter");
  }
  const items = page.locator(".todo-list li");
  await items.filter({ hasText: "A" }).hover();
  await items.filter({ hasText: "A" }).locator(".destroy").click();
  await input.fill("D");
  await input.press("Enter");
  await expect(items).toHaveText(["B", "C", "D"]);

  await items.filter({ hasText: "C" }).locator(".toggle").check();
  await expect(page.locator(".todo-list li.completed")).toHaveText(["C"]);

  await items.filter({ hasText: "D" }).hover();
  await items.filter({ hasText: "D" }).locator(".destroy").click();
  await expect(items).toHaveText(["B", "C"]);
});
