import { expect, test, type Locator, type Page } from "@playwright/test";
import { addTodos, item, openApp, titles } from "../helpers";

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await addTodos(page, "Buy milk", "Walk the dog");
});

async function focusedInside(li: Locator) {
  return li.evaluate((el) => el.contains(document.activeElement));
}

/** Press Tab from the todo's checkbox until focus reaches an element matching `match`, or give up. */
async function tabTo(page: Page, li: Locator, match: (el: Element) => boolean, maxTabs = 6) {
  await li.locator(".toggle").focus();
  for (let i = 0; i < maxTabs; i++) {
    await page.keyboard.press("Tab");
    const hit = await page.evaluate((src) => {
      const el = document.activeElement;
      return !!el && new Function("el", `return (${src})(el)`)(el);
    }, match.toString());
    if (hit) return true;
  }
  return false;
}

const isDelete = (el: Element) =>
  el.classList.contains("destroy") || /delete|remove/i.test(el.getAttribute("aria-label") ?? el.textContent ?? "");

test("each todo's checkbox is named after the todo", async ({ page }) => {
  await expect(page.getByRole("checkbox", { name: /buy milk/i })).toHaveCount(1);
  await expect(page.getByRole("checkbox", { name: /walk the dog/i })).toHaveCount(1);
});

test("each delete button says what it does", async ({ page }) => {
  await expect(item(page, "Buy milk").getByRole("button", { name: /delete|remove/i })).toHaveCount(1);
});

test("each delete button names its todo", async ({ page }) => {
  await expect(item(page, "Buy milk").getByRole("button", { name: /(delete|remove).*buy milk/i })).toHaveCount(1);
});

test("the new todo field has a real label, not only a placeholder", async ({ page }) => {
  const labelled = await page.locator(".new-todo").evaluate(
    (el) =>
      (el as HTMLInputElement).labels!.length > 0 || !!el.getAttribute("aria-label") || !!el.getAttribute("aria-labelledby"),
  );
  expect(labelled).toBe(true);
});

test("the delete button can be reached with Tab and is visible when focused", async ({ page }) => {
  const li = item(page, "Buy milk");
  expect(await tabTo(page, li, isDelete)).toBe(true);
  const focused = page.locator(":focus");
  await expect(focused).toBeVisible();
  expect(Number(await focused.evaluate((el) => getComputedStyle(el).opacity))).toBeGreaterThan(0.5);
});

test("a todo can be deleted from the keyboard", async ({ page }) => {
  const li = item(page, "Buy milk");
  expect(await tabTo(page, li, isDelete)).toBe(true);
  await page.keyboard.press("Enter");
  expect(await titles(page)).toEqual(["Walk the dog"]);
});

/** Find a keyboard path into edit mode: an Edit button, or Enter or F2 on a focusable title. */
async function enterEditWithKeyboard(page: Page, li: Locator) {
  await li.locator(".toggle").focus();
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    if (!(await focusedInside(li))) return false;
    const kind = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      if (el.classList.contains("toggle") || el.classList.contains("destroy")) return "skip";
      if (/delete|remove/i.test(el.getAttribute("aria-label") ?? el.textContent ?? "")) return "skip";
      return "try";
    });
    if (kind === "skip") continue;
    for (const key of ["Enter", "F2"]) {
      await page.keyboard.press(key);
      if (await li.locator(".edit").isVisible()) return true;
    }
  }
  return false;
}

test("a todo can be edited from the keyboard", async ({ page }) => {
  const li = item(page, "Buy milk");
  expect(await enterEditWithKeyboard(page, li)).toBe(true);
  const edit = page.locator(".todo-list .edit:visible");
  await expect(edit).toBeFocused();
  await edit.fill("Buy oat milk");
  await edit.press("Enter");
  expect(await titles(page)).toEqual(["Buy oat milk", "Walk the dog"]);
});

test("Escape from a keyboard edit keeps the title and keeps focus in the todo", async ({ page }) => {
  const li = item(page, "Buy milk");
  expect(await enterEditWithKeyboard(page, li)).toBe(true);
  await page.locator(".todo-list .edit:visible").fill("Changed");
  await page.keyboard.press("Escape");
  expect(await titles(page)).toEqual(["Buy milk", "Walk the dog"]);
  await expect.poll(() => focusedInside(item(page, "Buy milk"))).toBe(true);
});
