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

test("shows completion progress", async ({ page }) => {
  await page.goto("/");
  const progress = page.getByRole("progressbar", { name: "Todos completed" });
  await expect(progress).toHaveCount(0);
  const input = page.getByPlaceholder("What needs to be done?");
  for (const title of ["Buy milk", "Walk the dog"]) {
    await input.fill(title);
    await input.press("Enter");
  }
  await expect(progress).toHaveText("0% complete");
  await page.locator(".todo-list li .toggle").first().check();
  await expect(progress).toHaveText("50% complete");
  await expect(progress).toHaveAttribute("aria-valuenow", "50");
  await page.locator(".todo-list li").first().hover();
  await page.locator(".todo-list li .destroy").first().click();
  await expect(progress).toHaveText("0% complete");
  await page.locator(".todo-list li").first().hover();
  await page.locator(".todo-list li .destroy").first().click();
  await expect(progress).toHaveCount(0);
});
