import { expect, test, type Page } from "@playwright/test";
import { addTodos, openApp, toggle } from "../helpers";
import { expectOrder } from "../chain-helpers";

const search = (page: Page) => page.getByLabel("Search", { exact: true });

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await addTodos(page, "Buy milk", "Walk the dog", "Buy eggs");
});

test("shows only todos whose title contains the text", async ({ page }) => {
  await search(page).fill("buy");
  await expectOrder(page, ["Buy milk", "Buy eggs"]);
});

test("ignores letter case", async ({ page }) => {
  await search(page).fill("MILK");
  await expectOrder(page, ["Buy milk"]);
});

test("clearing the search shows every todo again", async ({ page }) => {
  await search(page).fill("dog");
  await expectOrder(page, ["Walk the dog"]);
  await search(page).fill("");
  await expectOrder(page, ["Buy milk", "Walk the dog", "Buy eggs"]);
});

test("searches within the current filter", async ({ page }) => {
  await toggle(page, "Buy eggs");
  await page.locator(".filters").getByRole("link", { name: "Active" }).click();
  await expect(page).toHaveURL(/\/active$/);
  await expectOrder(page, ["Buy milk", "Walk the dog"]);
  await search(page).fill("buy");
  await expectOrder(page, ["Buy milk"]);
});

test("the item counter still counts every active todo", async ({ page }) => {
  await search(page).fill("dog");
  await expect(page.locator(".todo-count")).toContainText(/(?<!\d)3(?!\d)/);
});
