import { expect, test, type Page } from "@playwright/test";

async function addTodos(page: Page, ...titles: string[]) {
  const input = page.getByRole("textbox", { name: "New todo" });
  for (const title of titles) {
    await input.fill(title);
    await input.press("Enter");
  }
}

// Reach the row buttons the way a keyboard user does: Tab forward from the row's checkbox.
async function tabTo(page: Page, todo: string, button: "Edit" | "Delete") {
  await page.getByRole("checkbox", { name: todo }).focus();
  await page.keyboard.press("Tab");
  if (button === "Delete") await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: `${button} "${todo}"` })).toBeFocused();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await addTodos(page, "Buy milk", "Walk dog");
});

test("every todo control has an accessible name", async ({ page }) => {
  await expect(page.getByRole("checkbox", { name: "Buy milk" })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Mark all as complete" })).toBeAttached();
  await expect(page.getByRole("button", { name: 'Edit "Buy milk"' })).toBeAttached();
  await expect(page.getByRole("button", { name: 'Delete "Buy milk"' })).toBeAttached();
  await expect(page.getByRole("button", { name: 'Important "Buy milk"' })).toBeAttached();
});

test("toggles a todo from the keyboard", async ({ page }) => {
  const checkbox = page.getByRole("checkbox", { name: "Buy milk" });
  await checkbox.focus();
  await page.keyboard.press("Space");
  await expect(checkbox).toBeChecked();
  await expect(page.locator(".todo-count")).toHaveText("1 item left");
});

test("delete and edit buttons appear when a row control is focused", async ({ page }) => {
  await page.getByRole("checkbox", { name: "Buy milk" }).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: 'Edit "Buy milk"' })).toBeFocused();
  await expect(page.getByRole("button", { name: 'Edit "Buy milk"' })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: 'Delete "Buy milk"' })).toBeFocused();
  await expect(page.getByRole("button", { name: 'Delete "Buy milk"' })).toBeVisible();
});

test("deletes a todo from the keyboard and keeps focus in the list", async ({ page }) => {
  await tabTo(page, "Buy milk", "Delete");
  await page.keyboard.press("Enter");
  await expect(page.locator(".todo-list li")).toHaveText(["Walk dog"]);
  await expect(page.getByRole("checkbox", { name: "Walk dog" })).toBeFocused();

  await tabTo(page, "Walk dog", "Delete");
  await page.keyboard.press("Enter");
  await expect(page.locator(".todo-list li")).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "New todo" })).toBeFocused();
});

test("edits a todo from the keyboard", async ({ page }) => {
  await tabTo(page, "Buy milk", "Edit");
  await page.keyboard.press("Enter");
  const field = page.getByRole("textbox", { name: 'Edit "Buy milk"' });
  await expect(field).toBeFocused();
  await field.fill("Buy oat milk");
  await page.keyboard.press("Enter");
  await expect(page.locator(".todo-list li label")).toHaveText(["Buy oat milk", "Walk dog"]);
  await expect(page.getByRole("button", { name: 'Edit "Buy oat milk"' })).toBeFocused();
});

test("Escape cancels an edit and returns focus", async ({ page }) => {
  await tabTo(page, "Buy milk", "Edit");
  await page.keyboard.press("Enter");
  await page.getByRole("textbox", { name: 'Edit "Buy milk"' }).fill("Something else");
  await page.keyboard.press("Escape");
  await expect(page.locator(".todo-list li label")).toHaveText(["Buy milk", "Walk dog"]);
  await expect(page.getByRole("button", { name: 'Edit "Buy milk"' })).toBeFocused();
});

test("marks a todo important from the keyboard and keeps the mark across reloads", async ({ page }) => {
  await tabTo(page, "Buy milk", "Delete");
  await page.keyboard.press("Tab");
  const star = page.getByRole("button", { name: 'Important "Buy milk"' });
  await expect(star).toBeFocused();
  await expect(star).toHaveAttribute("aria-pressed", "false");

  await page.keyboard.press("Enter");
  await expect(star).toHaveAttribute("aria-pressed", "true");
  await expect(star).toBeFocused();
  await expect(page.getByRole("button", { name: 'Important "Walk dog"' })).toHaveAttribute("aria-pressed", "false");

  await page.reload();
  await expect(star).toHaveAttribute("aria-pressed", "true");

  await star.focus();
  await page.keyboard.press("Space");
  await expect(star).toHaveAttribute("aria-pressed", "false");
});

test("the important mark survives editing and completing a todo", async ({ page }) => {
  await page.getByRole("button", { name: 'Important "Buy milk"' }).click();
  await tabTo(page, "Buy milk", "Edit");
  await page.keyboard.press("Enter");
  await page.getByRole("textbox", { name: 'Edit "Buy milk"' }).fill("Buy oat milk");
  await page.keyboard.press("Enter");
  await page.getByRole("checkbox", { name: "Buy oat milk" }).check({ force: true });
  await expect(page.getByRole("button", { name: 'Important "Buy oat milk"' })).toHaveAttribute("aria-pressed", "true");
});

test("marks only the chosen todo after an earlier todo is deleted", async ({ page }) => {
  await page.getByRole("button", { name: 'Delete "Buy milk"' }).click({ force: true });
  await addTodos(page, "Call mum");
  await page.getByRole("button", { name: 'Important "Call mum"' }).click();
  await expect(page.getByRole("button", { name: 'Important "Walk dog"' })).toHaveAttribute("aria-pressed", "false");
});

test("double-click still edits a todo", async ({ page }) => {
  await page.getByText("Walk dog").dblclick();
  await expect(page.getByRole("textbox", { name: 'Edit "Walk dog"' })).toBeFocused();
});
