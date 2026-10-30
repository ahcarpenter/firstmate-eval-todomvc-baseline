import { expect, test } from "@playwright/test";

test("adds a todo", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Buy milk");
  await input.press("Enter");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk"]);
  await expect(page.locator(".todo-count")).toHaveText("1 item left");
});

test("counts completed todos", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  for (const title of ["Buy milk", "Walk the dog"]) {
    await input.fill(title);
    await input.press("Enter");
  }
  const completedCount = page.locator(".completed-count");
  await expect(completedCount).toHaveText("0 completed");
  await page.locator(".todo-list li .toggle").first().check();
  await expect(completedCount).toHaveText("1 completed");
  await page.reload();
  await expect(completedCount).toHaveText("1 completed");
  await page.getByRole("button", { name: "Clear completed" }).click();
  await expect(completedCount).toHaveText("0 completed");
});
