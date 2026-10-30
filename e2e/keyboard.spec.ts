import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  const input = page.getByRole("textbox", { name: "New todo" });
  await input.fill("Buy milk");
  await input.press("Enter");
});

test("every todo control has an accessible name", async ({ page }) => {
  await expect(page.getByRole("checkbox", { name: "Buy milk" })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Mark all as complete" })).toBeAttached();
  await expect(page.getByRole("button", { name: "Edit Buy milk" })).toBeAttached();
  await expect(page.getByRole("button", { name: "Delete Buy milk" })).toBeAttached();
  await expect(page.getByRole("link", { name: "All" })).toHaveAttribute("aria-current", "page");
});

test("toggles a todo from the keyboard", async ({ page }) => {
  const toggle = page.getByRole("checkbox", { name: "Buy milk" });
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(toggle).toBeChecked();
  await expect(page.locator(".todo-count")).toHaveText("0 items left");
});

test("edits a todo from the keyboard", async ({ page }) => {
  await page.getByRole("checkbox", { name: "Buy milk" }).focus();
  await page.keyboard.press("Tab");
  const editButton = page.getByRole("button", { name: "Edit Buy milk" });
  await expect(editButton).toBeFocused();
  await expect(editButton).toHaveCSS("opacity", "1");
  await page.keyboard.press("Enter");

  const field = page.getByRole("textbox", { name: "Edit Buy milk" });
  await expect(field).toBeFocused();
  await field.fill("Buy oat milk");
  await page.keyboard.press("Enter");

  await expect(page.locator(".todo-list li")).toHaveText(["Buy oat milk"]);
  await expect(page.getByRole("button", { name: "Edit Buy oat milk" })).toBeFocused();
});

test("escape cancels an edit and returns focus", async ({ page }) => {
  await page.getByRole("button", { name: "Edit Buy milk" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("textbox", { name: "Edit Buy milk" }).fill("Something else");
  await page.keyboard.press("Escape");

  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk"]);
  await expect(page.getByRole("button", { name: "Edit Buy milk" })).toBeFocused();
});

test("deletes a todo from the keyboard", async ({ page }) => {
  await page.getByRole("button", { name: "Edit Buy milk" }).focus();
  await page.keyboard.press("Tab");
  const destroy = page.getByRole("button", { name: "Delete Buy milk" });
  await expect(destroy).toBeFocused();
  await expect(destroy).toHaveCSS("opacity", "1");
  await page.keyboard.press("Enter");

  await expect(page.locator(".todo-list li")).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "New todo" })).toBeFocused();
});

test("double-click editing still saves on blur", async ({ page }) => {
  await page.getByText("Buy milk").dblclick();
  await page.getByRole("textbox", { name: "Edit Buy milk" }).fill("Buy bread");
  await page.getByRole("textbox", { name: "New todo" }).click();

  await expect(page.locator(".todo-list li")).toHaveText(["Buy bread"]);
  await expect(page.getByRole("textbox", { name: "New todo" })).toBeFocused();
});
