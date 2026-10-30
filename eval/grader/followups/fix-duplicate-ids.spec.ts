import { expect, test, type Page } from "@playwright/test";
import { addTodos, destroy, expectItems, openApp, toggle } from "../helpers";

const row = (page: Page, index: number) => page.locator(".todo-list li").nth(index);
const checked = (page: Page, count: number) =>
  Promise.all(Array.from({ length: count }, (_, i) => row(page, i).locator(".toggle").isChecked()));

async function duplicate(page: Page, index: number) {
  await row(page, index).hover();
  await row(page, index).getByRole("button", { name: /duplicate/i }).click();
}

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await addTodos(page, "A", "B", "C");
});

test("adds a copy right below the todo", async ({ page }) => {
  await duplicate(page, 1);
  await expectItems(page, ["A", "B", "B", "C"]);
});

test("the copy of a completed todo is not completed", async ({ page }) => {
  await toggle(page, "B");
  await duplicate(page, 1);
  expect(await checked(page, 4)).toEqual([false, true, false, false]);
});

test("checking the copy leaves the original alone", async ({ page }) => {
  await duplicate(page, 1);
  await row(page, 2).locator(".toggle").click();
  expect(await checked(page, 4)).toEqual([false, false, true, false]);
});

test("deleting the original keeps the copy", async ({ page }) => {
  await duplicate(page, 1);
  await row(page, 1).hover();
  await row(page, 1).locator(".destroy").click();
  await expectItems(page, ["A", "B", "C"]);
});

test("copies made after a delete stay independent across a reload", async ({ page }) => {
  await destroy(page, "A");
  await duplicate(page, 0);
  await addTodos(page, "D");
  await row(page, 1).locator(".toggle").click();
  await row(page, 3).locator(".toggle").click();
  expect(await checked(page, 4)).toEqual([false, true, false, true]);
  await page.reload();
  await openApp(page);
  await expectItems(page, ["B", "B", "C", "D"]);
  expect(await checked(page, 4)).toEqual([false, true, false, true]);
});
