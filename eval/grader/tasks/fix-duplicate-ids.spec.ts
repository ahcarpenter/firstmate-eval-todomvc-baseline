import { expect, test } from "@playwright/test";
import { addTodos, destroy, item, openApp, seedStorage, STORAGE_KEY, storedTodos, titles, toggle } from "../helpers";

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test("checking a todo added after a delete checks only that todo", async ({ page }) => {
  await addTodos(page, "A", "B", "C");
  await destroy(page, "A");
  await addTodos(page, "D");
  await toggle(page, "D");
  await expect(item(page, "D")).toHaveClass(/completed/);
  await expect(item(page, "C")).not.toHaveClass(/completed/);
  await expect(page.locator(".todo-count")).toHaveText(/2 items left/);
});

test("deleting a todo added after a delete removes only that todo", async ({ page }) => {
  await addTodos(page, "A", "B", "C");
  await destroy(page, "A");
  await addTodos(page, "D");
  await destroy(page, "D");
  expect(await titles(page)).toEqual(["B", "C"]);
});

test("editing a todo added after a delete edits only that todo", async ({ page }) => {
  await addTodos(page, "A", "B", "C");
  await destroy(page, "A");
  await addTodos(page, "D");
  await item(page, "D").locator("label").dblclick();
  await page.locator(".todo-list li.editing .edit").fill("D2");
  await page.locator(".todo-list li.editing .edit").press("Enter");
  expect(await titles(page)).toEqual(["B", "C", "D2"]);
});

test("a todo added to saved todos whose ids are out of order stays separate", async ({ page }) => {
  await seedStorage(page, {
    [STORAGE_KEY]: [
      { id: 3, title: "Old three", completed: false },
      { id: 1, title: "Old one", completed: false },
    ],
  });
  await openApp(page);
  await addTodos(page, "New one", "New two");
  await toggle(page, "New one");
  await expect(page.locator(".todo-list li.completed label")).toHaveText(["New one"]);
  await destroy(page, "New two");
  expect(await titles(page)).toEqual(["Old three", "Old one", "New one"]);
});

test("saved todos keep unique ids after deletes, adds, and a reload", async ({ page }) => {
  await addTodos(page, "A", "B", "C");
  await destroy(page, "A");
  await destroy(page, "B");
  await addTodos(page, "D", "E");
  await page.reload();
  await openApp(page);
  await addTodos(page, "F");
  const saved = (await storedTodos(page)) ?? [];
  const ids = saved.map((todo) => JSON.stringify(todo.id));
  expect(ids).toHaveLength(4);
  expect(new Set(ids).size).toBe(4);
});
