import { expect, test, type Page } from "@playwright/test";

async function addTodos(page: Page, titles: string[]) {
  const input = page.getByPlaceholder("What needs to be done?");
  for (const title of titles) {
    await input.fill(title);
    await input.press("Enter");
  }
}

async function destroy(page: Page, title: string) {
  const item = page.locator(".todo-list li").filter({ hasText: title });
  await item.hover();
  await item.locator(".destroy").click();
}

test("undo restores a deleted todo in place", async ({ page }) => {
  await page.goto("/");
  await addTodos(page, ["Buy milk", "Walk the dog", "Call mum"]);
  await destroy(page, "Walk the dog");

  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk", "Call mum"]);
  await expect(page.getByRole("status")).toContainText("Deleted “Walk the dog”");

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk", "Walk the dog", "Call mum"]);
  await expect(page.getByRole("button", { name: "Undo" })).toHaveCount(0);

  await page.reload();
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk", "Walk the dog", "Call mum"]);
});

test("the undo offer expires after a few seconds", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await addTodos(page, ["Buy milk", "Walk the dog"]);
  await destroy(page, "Buy milk");
  await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();

  await page.clock.runFor(4000);
  await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();

  await page.clock.runFor(1000);
  await expect(page.getByRole("button", { name: "Undo" })).toHaveCount(0);

  await page.reload();
  await expect(page.locator(".todo-list li")).toHaveText(["Walk the dog"]);
});

test("a second delete replaces the first undo offer", async ({ page }) => {
  await page.goto("/");
  await addTodos(page, ["Buy milk", "Walk the dog"]);
  await destroy(page, "Buy milk");
  await destroy(page, "Walk the dog");

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.locator(".todo-list li")).toHaveText(["Walk the dog"]);
});
