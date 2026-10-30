import { expect, test } from "@playwright/test";

test("adds a todo", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Buy milk");
  await input.press("Enter");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk"]);
  await expect(page.locator(".todo-count")).toHaveText("1 item left");
});

test("does not add a todo that is already active", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Buy milk");
  await input.press("Enter");
  await input.fill(" buy MILK ");
  await input.press("Enter");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk"]);
  await expect(page.getByRole("status")).toHaveText("“Buy milk” is already on your list.");
  await expect(input).toHaveValue(" buy MILK ");

  await input.fill("Buy bread");
  await expect(page.getByRole("status")).toHaveText("");
});

test("adds a todo again once the earlier one is completed", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Buy milk");
  await input.press("Enter");
  await page.locator(".todo-list li .toggle").check();
  await input.fill("Buy milk");
  await input.press("Enter");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk", "Buy milk"]);
  await expect(page.getByRole("status")).toHaveText("");
});

test("does not rename a todo to the title of an active todo", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  for (const title of ["Buy milk", "Buy bread"]) {
    await input.fill(title);
    await input.press("Enter");
  }
  await page.locator(".todo-list li label").nth(1).dblclick();
  await page.locator(".todo-list li .edit").fill(" buy MILK ");
  await page.locator(".todo-list li .edit").press("Enter");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk", "Buy bread"]);
  await expect(page.getByRole("status")).toHaveText("“Buy milk” is already on your list.");
});

test("renames a todo to the title of a completed todo", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  for (const title of ["Buy milk", "Buy bread"]) {
    await input.fill(title);
    await input.press("Enter");
  }
  await page.locator(".todo-list li .toggle").first().check();
  await page.locator(".todo-list li label").nth(1).dblclick();
  await page.locator(".todo-list li .edit").fill("Buy milk");
  await page.locator(".todo-list li .edit").press("Enter");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk", "Buy milk"]);
  await expect(page.getByRole("status")).toHaveText("");
});
