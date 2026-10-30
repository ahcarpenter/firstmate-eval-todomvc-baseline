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

test("shows completion progress as a bar", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".progress")).toHaveCount(0);
  const input = page.getByPlaceholder("What needs to be done?");
  for (const title of ["Buy milk", "Walk the dog", "Read a book", "Write code", "Call mom"]) {
    await input.fill(title);
    await input.press("Enter");
  }
  const bar = page.getByRole("progressbar");
  await expect(bar).toHaveAttribute("aria-valuenow", "0");
  await page.locator(".todo-list li .toggle").first().check();
  await page.locator(".todo-list li .toggle").nth(1).check();
  await expect(bar).toHaveAttribute("aria-valuenow", "40");
  await expect(page.locator(".progress-label")).toHaveText("40% complete");
  await page.getByText("Mark all as complete").click();
  await expect(page.locator(".progress-label")).toHaveText("100% complete");
  await page.getByRole("button", { name: "Clear completed" }).click();
  await expect(page.locator(".progress")).toHaveCount(0);
});
