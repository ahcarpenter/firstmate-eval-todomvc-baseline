import { expect, test, type Page } from "@playwright/test";
import { addTodos, item, openApp, titles, toggle } from "../helpers";

async function rename(page: Page, title: string, next: string) {
  await item(page, title).locator("label").dblclick();
  const field = page.locator(".todo-list li.editing .edit");
  await field.fill(next);
  await field.press("Enter");
}
// A refused edit may stay open; Escape closes it without saving.
async function closeEdit(page: Page) {
  const open = page.locator(".todo-list li.editing .edit");
  if (await open.count()) await open.press("Escape");
}
const trimmed = async (page: Page) => (await titles(page)).map((t) => t.trim());

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await addTodos(page, "Buy milk", "Walk the dog", "Call mom");
});

test("refuses renaming a todo to another active todo's title", async ({ page }) => {
  await rename(page, "Walk the dog", "Buy milk");
  await closeEdit(page);
  expect(await trimmed(page)).toEqual(["Buy milk", "Walk the dog", "Call mom"]);
});

test("says the todo is already on the list", async ({ page }) => {
  await rename(page, "Walk the dog", "Buy milk");
  await expect(page.getByText(/already/i).first()).toBeVisible();
});

test("treats surrounding spaces as the same title", async ({ page }) => {
  await rename(page, "Walk the dog", "  Buy milk  ");
  await closeEdit(page);
  expect(await trimmed(page)).toEqual(["Buy milk", "Walk the dog", "Call mom"]);
});

test("allows renaming to a completed todo's title", async ({ page }) => {
  await toggle(page, "Buy milk");
  await rename(page, "Walk the dog", "Buy milk");
  await expect(page.locator(".todo-list li.editing")).toHaveCount(0);
  expect(await trimmed(page)).toEqual(["Buy milk", "Buy milk", "Call mom"]);
});

test("allows other renames and keeping a todo's own title", async ({ page }) => {
  await rename(page, "Walk the dog", "Walk the cat");
  await rename(page, "Call mom", "Call mom");
  await expect(page.locator(".todo-list li.editing")).toHaveCount(0);
  expect(await trimmed(page)).toEqual(["Buy milk", "Walk the cat", "Call mom"]);
  await expect(page.getByText(/already/i)).toHaveCount(0);
});
