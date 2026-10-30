import { expect, test, type Page } from "@playwright/test";
import { addTodos, item, openApp, titles, toggle } from "../helpers";

const undo = (page: Page) => page.getByRole("button", { name: /undo/i });
const clear = (page: Page) => page.locator(".clear-completed").click();
const trimmed = async (page: Page) => (await titles(page)).map((t) => t.trim());

test.beforeEach(async ({ page }) => {
  await page.clock.install();
  await openApp(page);
  await addTodos(page, "A", "B", "C", "D");
  await toggle(page, "B");
  await toggle(page, "D");
});

test("offers an undo after clearing completed todos", async ({ page }) => {
  await clear(page);
  expect(await trimmed(page)).toEqual(["A", "C"]);
  await expect(undo(page)).toBeVisible();
});

test("undo brings every cleared todo back in its place, still completed", async ({ page }) => {
  await clear(page);
  await undo(page).click();
  await expect(page.locator(".todo-list li")).toHaveCount(4);
  expect(await trimmed(page)).toEqual(["A", "B", "C", "D"]);
  await expect(item(page, "B").locator(".toggle")).toBeChecked();
  await expect(item(page, "D").locator(".toggle")).toBeChecked();
  await expect(item(page, "A").locator(".toggle")).not.toBeChecked();
});

test("restored todos are still there after a reload", async ({ page }) => {
  await clear(page);
  await undo(page).click();
  await expect(page.locator(".todo-list li")).toHaveCount(4);
  await page.reload();
  await openApp(page);
  expect(await trimmed(page)).toEqual(["A", "B", "C", "D"]);
});

test("the offer goes away after a while and the clear sticks", async ({ page }) => {
  await clear(page);
  await expect(undo(page)).toBeVisible();
  await page.clock.fastForward(20_000);
  await expect(undo(page)).toBeHidden();
  await page.reload();
  await openApp(page);
  expect(await trimmed(page)).toEqual(["A", "C"]);
});
