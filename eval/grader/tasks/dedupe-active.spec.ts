import { expect, test } from "@playwright/test";
import { addTodos, newTodo, openApp, titles, toggle } from "../helpers";

async function tryAdd(page: import("@playwright/test").Page, title: string) {
  await newTodo(page).fill(title);
  await newTodo(page).press("Enter");
}

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await addTodos(page, "Buy milk", "Walk the dog");
});

test("does not add an exact duplicate of an active todo", async ({ page }) => {
  await tryAdd(page, "Buy milk");
  await page.waitForTimeout(300);
  expect(await titles(page)).toEqual(["Buy milk", "Walk the dog"]);
});

test("treats surrounding spaces as the same todo", async ({ page }) => {
  await tryAdd(page, "   Buy milk  ");
  await page.waitForTimeout(300);
  expect(await titles(page)).toEqual(["Buy milk", "Walk the dog"]);
});

test("tells the person the todo is already on the list", async ({ page }) => {
  await tryAdd(page, "Buy milk");
  await expect(page.getByText(/already/i).first()).toBeVisible();
});

test("allows adding a todo again once the earlier one is completed", async ({ page }) => {
  await toggle(page, "Buy milk");
  await addTodos(page, "Buy milk");
  expect(await titles(page)).toEqual(["Buy milk", "Walk the dog", "Buy milk"]);
  await expect(page.locator(".todo-list li:not(.completed) label")).toHaveText(["Walk the dog", "Buy milk"]);
});

test("still adds a different todo after a duplicate attempt", async ({ page }) => {
  await tryAdd(page, "Buy milk");
  await addTodos(page, "Bake bread");
  expect(await titles(page)).toEqual(["Buy milk", "Walk the dog", "Bake bread"]);
});

test("treats a different letter case as the same todo @edge", async ({ page }) => {
  await tryAdd(page, "buy MILK");
  await page.waitForTimeout(300);
  expect(await titles(page)).toEqual(["Buy milk", "Walk the dog"]);
});
