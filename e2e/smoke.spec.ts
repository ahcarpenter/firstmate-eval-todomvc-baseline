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
