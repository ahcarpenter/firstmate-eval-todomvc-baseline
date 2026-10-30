import { expect, test } from "@playwright/test";
import { addTodos, destroy, item, openApp, titles, toggle } from "../helpers";

test.beforeEach(async ({ page }) => {
  await page.clock.install();
  await openApp(page);
  await addTodos(page, "A", "B", "C");
});

const undo = (page: import("@playwright/test").Page) => page.getByRole("button", { name: /undo/i });

test("offers an undo after a todo is deleted", async ({ page }) => {
  await destroy(page, "B");
  await expect(undo(page)).toBeVisible();
});

test("undo puts the todo back in its place with its state", async ({ page }) => {
  await toggle(page, "B");
  await destroy(page, "B");
  await undo(page).click();
  expect(await titles(page)).toEqual(["A", "B", "C"]);
  await expect(item(page, "B")).toHaveClass(/completed/);
  await expect(page.locator(".todo-count")).toHaveText(/2 items left/);
});

test("a restored todo is still there after a reload", async ({ page }) => {
  await destroy(page, "B");
  await undo(page).click();
  await page.reload();
  await openApp(page);
  expect(await titles(page)).toEqual(["A", "B", "C"]);
});

test("the undo offer goes away after a while and the delete sticks", async ({ page }) => {
  await destroy(page, "B");
  await expect(undo(page)).toBeVisible();
  await page.clock.fastForward(20_000);
  await expect(undo(page)).toBeHidden();
  await page.reload();
  await openApp(page);
  expect(await titles(page)).toEqual(["A", "C"]);
});

test("the offer is still there a couple of seconds later", async ({ page }) => {
  await destroy(page, "B");
  await page.clock.fastForward(2_000);
  await expect(undo(page)).toBeVisible();
});

test("undo after two deletes brings back the latest one @edge", async ({ page }) => {
  await destroy(page, "A");
  await destroy(page, "C");
  await undo(page).click();
  await expect(item(page, "C")).toHaveCount(1);
});
