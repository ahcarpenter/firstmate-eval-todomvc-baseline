import { expect, test } from "@playwright/test";

test("adds a todo", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Buy milk");
  await input.press("Enter");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk"]);
  await expect(page.locator(".todo-count")).toHaveText("1 item left");
});

test("shows how many todos are completed", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  for (const title of ["Buy milk", "Walk the dog", "Water plants"]) {
    await input.fill(title);
    await input.press("Enter");
  }
  const completed = page.locator(".completed-count");
  await expect(completed).toHaveText("0 completed");

  await page.locator(".todo-list li .toggle").nth(0).check();
  await page.locator(".todo-list li .toggle").nth(2).check();
  await expect(completed).toHaveText("2 completed");
  await expect(page.locator(".todo-count")).toHaveText("1 item left");

  await page.reload();
  await expect(completed).toHaveText("2 completed");

  await page.getByRole("button", { name: "Clear completed" }).click();
  await expect(completed).toHaveText("0 completed");
});

test("shows the share of completed todos as a progress bar", async ({ page }) => {
  await page.goto("/");
  const progress = page.getByRole("progressbar", { name: "Todos completed" });
  await expect(progress).toHaveCount(0);

  const input = page.getByPlaceholder("What needs to be done?");
  for (const title of ["Buy milk", "Walk the dog", "Water plants", "Read a book", "Call mom"]) {
    await input.fill(title);
    await input.press("Enter");
  }
  await expect(progress).toHaveText("0% complete");

  await page.locator(".todo-list li .toggle").nth(0).check();
  await page.locator(".todo-list li .toggle").nth(3).check();
  await expect(progress).toHaveText("40% complete");
  await expect(progress).toHaveAttribute("aria-valuenow", "40");

  await page.locator("#toggle-all").check();
  await expect(progress).toHaveText("100% complete");

  await page.getByRole("button", { name: "Clear completed" }).click();
  await expect(progress).toHaveCount(0);
});
