import { expect, test } from "@playwright/test";

test("adds a todo", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Buy milk");
  await input.press("Enter");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk"]);
  await expect(page.locator(".todo-count")).toHaveText("1 item left");
});

test("adds a todo with a due date that survives a reload", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Pay rent");
  await page.getByLabel("Due date").fill("2026-11-03");
  await input.press("Enter");
  await input.fill("Buy milk");
  await input.press("Enter");
  const items = page.locator(".todo-list li");
  await expect(items).toHaveText(["Pay rentDue Nov 3", "Buy milk"]);
  await expect(page.getByLabel("Due date")).toHaveValue("");
  await page.reload();
  await expect(items.nth(0).locator(".due")).toHaveText("Due Nov 3");
  await expect(items.nth(1).locator(".due")).toHaveCount(0);
});
