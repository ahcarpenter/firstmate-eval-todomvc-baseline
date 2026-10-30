import { expect, test } from "@playwright/test";

test("adds a todo", async ({ page }) => {
  await page.goto("/");
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill("Buy milk");
  await input.press("Enter");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk"]);
  await expect(page.locator(".todo-count")).toHaveText("1 item left");
});

test("every todo control has an accessible name", async ({ page }) => {
  await page.goto("/");
  const input = page.getByRole("textbox", { name: "New todo" });
  await input.fill("Buy milk");
  await input.press("Enter");
  await expect(page.getByRole("checkbox", { name: "Buy milk" })).toBeVisible();
  await expect(page.getByRole("button", { name: 'Edit "Buy milk"' })).toBeAttached();
  await expect(page.getByRole("button", { name: 'Delete "Buy milk"' })).toBeAttached();
  await expect(page.getByRole("checkbox", { name: "Mark all as complete" })).toBeAttached();
  await expect(page.getByRole("link", { name: "All" })).toHaveAttribute("aria-current", "page");
});

test("toggles, edits, and deletes todos from the keyboard", async ({ page }) => {
  await page.goto("/");
  const input = page.getByRole("textbox", { name: "New todo" });
  for (const title of ["Buy milk", "Walk dog"]) {
    await input.fill(title);
    await input.press("Enter");
  }

  // Toggle: Tab to the first todo's checkbox and press Space.
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const toggle = page.getByRole("checkbox", { name: "Buy milk" });
  await expect(toggle).toBeFocused();
  await page.keyboard.press("Space");
  await expect(toggle).toBeChecked();

  // Edit: Tab to the Edit button, which becomes visible on focus, and press Enter.
  await page.keyboard.press("Tab");
  const edit = page.getByRole("button", { name: 'Edit "Buy milk"' });
  await expect(edit).toBeFocused();
  await expect(edit).toBeVisible();
  await page.keyboard.press("Enter");
  const field = page.getByRole("textbox", { name: 'Edit "Buy milk"' });
  await expect(field).toBeFocused();
  await field.fill("Buy oat milk");
  await page.keyboard.press("Enter");
  await expect(page.locator(".todo-list li label")).toHaveText(["Buy oat milk", "Walk dog"]);
  await expect(page.getByRole("button", { name: 'Edit "Buy oat milk"' })).toBeFocused();

  // Escape cancels an edit and keeps the old title.
  await page.keyboard.press("Enter");
  await page.keyboard.type(" later");
  await page.keyboard.press("Escape");
  await expect(page.locator(".todo-list li label")).toHaveText(["Buy oat milk", "Walk dog"]);
  await expect(page.getByRole("button", { name: 'Edit "Buy oat milk"' })).toBeFocused();

  // Delete: Tab to the Delete button, which becomes visible on focus, and press Enter.
  await page.keyboard.press("Tab");
  const destroy = page.getByRole("button", { name: 'Delete "Buy oat milk"' });
  await expect(destroy).toBeFocused();
  await expect(destroy).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.locator(".todo-list li label")).toHaveText(["Walk dog"]);
  await expect(page.getByRole("checkbox", { name: "Walk dog" })).toBeFocused();
});

test("keeps focus in the list when a toggled todo leaves the filtered view", async ({ page }) => {
  await page.goto("/active");
  const input = page.getByRole("textbox", { name: "New todo" });
  for (const title of ["Buy milk", "Walk dog"]) {
    await input.fill(title);
    await input.press("Enter");
  }
  await page.getByRole("checkbox", { name: "Buy milk" }).focus();
  await page.keyboard.press("Space");
  await expect(page.locator(".todo-list li label")).toHaveText(["Walk dog"]);
  await expect(page.getByRole("checkbox", { name: "Walk dog" })).toBeFocused();
});

test("still edits on double-click", async ({ page }) => {
  await page.goto("/");
  const input = page.getByRole("textbox", { name: "New todo" });
  await input.fill("Buy milk");
  await input.press("Enter");
  await page.locator(".todo-list li label").dblclick();
  const field = page.getByRole("textbox", { name: 'Edit "Buy milk"' });
  await field.fill("Buy bread");
  await field.press("Enter");
  await expect(page.locator(".todo-list li label")).toHaveText(["Buy bread"]);
});
