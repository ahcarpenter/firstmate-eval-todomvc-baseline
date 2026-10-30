import { expect, test } from "@playwright/test";

test("adds a todo", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Buy milk");
  await input.press("Enter");
  await expect(page.locator(".todo-list li label")).toHaveText(["Buy milk"]);
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
  const item = (title: string) => items.filter({ has: page.getByText(title, { exact: true }) });
  await item("A").hover();
  await item("A").locator(".destroy").click();
  await input.fill("D");
  await input.press("Enter");
  await expect(items.locator("label")).toHaveText(["B", "C", "D"]);

  await item("C").locator(".toggle").check();
  await expect(page.locator(".todo-list li.completed label")).toHaveText(["C"]);

  await item("D").hover();
  await item("D").locator(".destroy").click();
  await expect(items.locator("label")).toHaveText(["B", "C"]);
});

test("duplicates a todo right below it as its own active todo", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  for (const title of ["A", "B"]) {
    await input.fill(title);
    await input.press("Enter");
  }
  const items = page.locator(".todo-list li");
  await items.nth(0).locator(".toggle").check();
  await items.nth(0).hover();
  await items.nth(0).getByRole("button", { name: "Duplicate" }).click();
  await expect(items.locator("label")).toHaveText(["A", "A", "B"]);
  await expect(items.nth(1)).not.toHaveClass("completed");

  // The copy has its own id: toggling and deleting it leave the original alone.
  await items.nth(1).locator(".toggle").check();
  await expect(page.locator(".todo-list li.completed")).toHaveCount(2);
  await items.nth(1).hover();
  await items.nth(1).locator(".destroy").click();
  await expect(items.locator("label")).toHaveText(["A", "B"]);
  await expect(items.nth(0)).toHaveClass("completed");

  await items.nth(1).hover();
  await items.nth(1).getByRole("button", { name: "Duplicate" }).click();
  await page.reload();
  await expect(items.locator("label")).toHaveText(["A", "B", "B"]);
  await expect(page.locator(".todo-list li.completed")).toHaveCount(1);
});
