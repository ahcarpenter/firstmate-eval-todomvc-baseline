import { expect, test, type Page } from "@playwright/test";
import { addTodos, expectItems, item, openApp, toggle } from "../helpers";

async function press(page: Page, title: string, name: RegExp) {
  const li = item(page, title);
  await li.hover();
  await li.getByRole("button", { name }).click();
}
const pin = (page: Page, title: string) => press(page, title, /^\s*pin\b/i);
const unpin = (page: Page, title: string) => press(page, title, /^\s*unpin\b/i);

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await addTodos(page, "A", "B", "C", "D");
});

test("a pinned todo moves to the top", async ({ page }) => {
  await pin(page, "C");
  await expectItems(page, ["C", "A", "B", "D"]);
});

test("pinned todos keep their usual order among themselves", async ({ page }) => {
  await pin(page, "D");
  await pin(page, "B");
  await expectItems(page, ["B", "D", "A", "C"]);
});

test("unpinning puts the todo back in its usual place", async ({ page }) => {
  await pin(page, "C");
  await unpin(page, "C");
  await expectItems(page, ["A", "B", "C", "D"]);
});

test("pins are kept across a reload", async ({ page }) => {
  await pin(page, "C");
  await page.reload();
  await openApp(page);
  await expectItems(page, ["C", "A", "B", "D"]);
  await item(page, "C").hover();
  await expect(item(page, "C").getByRole("button", { name: /^\s*unpin\b/i })).toHaveCount(1);
});

test("the filters still apply to pinned todos", async ({ page }) => {
  await pin(page, "C");
  await toggle(page, "C");
  await page.locator(".filters").getByRole("link", { name: "Active" }).click();
  await expectItems(page, ["A", "B", "D"]);
  await page.locator(".filters").getByRole("link", { name: "Completed" }).click();
  await expectItems(page, ["C"]);
});
