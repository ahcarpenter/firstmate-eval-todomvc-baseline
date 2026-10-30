import { expect, test, type Page } from "@playwright/test";
import { addTodos, openApp, toggle } from "../helpers";

// The ask leaves the wording and placement open, so these tests accept any visible
// text that puts the number next to "completed" or "done" on the same line; adjacent
// inline elements can run together in the page text, so only digits bound the number.
function completedText(n: number) {
  return new RegExp(`((?<!\\d)${n}(?!\\d)[^\\n]{0,25}(completed|done|finished))|((completed|done|finished)[^\\n]{0,25}(?<!\\d)${n}(?!\\d))`, "i");
}

async function appText(page: Page) {
  return page.locator("body").innerText();
}

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await addTodos(page, "One", "Two", "Three");
});

test("shows how many todos are completed", async ({ page }) => {
  await toggle(page, "One");
  await toggle(page, "Two");
  await expect.poll(() => appText(page)).toMatch(completedText(2));
});

test("updates when a todo is unchecked", async ({ page }) => {
  await toggle(page, "One");
  await toggle(page, "Two");
  await toggle(page, "Two");
  await expect.poll(() => appText(page)).toMatch(completedText(1));
});

test("counts todos completed with mark all as complete", async ({ page }) => {
  await page.locator(".toggle-all").check({ force: true });
  await expect.poll(() => appText(page)).toMatch(completedText(3));
});

test("shows the same count after a reload", async ({ page }) => {
  await toggle(page, "Three");
  await page.reload();
  await openApp(page);
  await expect.poll(() => appText(page)).toMatch(completedText(1));
});

test("works on the filtered views too @edge", async ({ page }) => {
  await toggle(page, "One");
  await page.locator(".filters").getByRole("link", { name: "Active" }).click();
  await expect.poll(() => appText(page)).toMatch(completedText(1));
});
