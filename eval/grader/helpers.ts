import { expect, type Page } from "@playwright/test";

export const STORAGE_KEY = "todos-nextjs";

/** Open a page and wait until React has hydrated the new-todo field. */
export async function openApp(page: Page, path = "/") {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
  await page.waitForFunction(() => {
    const input = document.querySelector(".new-todo");
    return !!input && Object.keys(input).some((key) => key.startsWith("__reactFiber"));
  });
}

/** Write raw localStorage data before the app reads it, from a same-origin page that runs no app code. */
export async function seedStorage(page: Page, entries: Record<string, unknown>) {
  await page.goto("/__grader-seed-404");
  await page.evaluate((data) => {
    window.localStorage.clear();
    for (const [key, value] of Object.entries(data)) window.localStorage.setItem(key, JSON.stringify(value));
  }, entries);
}

export function newTodo(page: Page) {
  return page.locator(".new-todo");
}

export async function addTodos(page: Page, ...titles: string[]) {
  for (const title of titles) {
    const before = await page.locator(".todo-list li").count();
    await newTodo(page).fill(title);
    await newTodo(page).press("Enter");
    if (title.trim()) await expect(page.locator(".todo-list li")).toHaveCount(before + 1);
  }
}

export function item(page: Page, title: string) {
  // The label starts with the title; a task may render more (such as a due date) after it,
  // sometimes with no space between, so only a lowercase letter or digit continues the title.
  return page.locator(".todo-list li").filter({ has: page.locator("label", { hasText: new RegExp(`^\\s*${escape(title)}(?![a-z0-9_])`) }) });
}

export async function titles(page: Page) {
  return page.locator(".todo-list li label").allTextContents();
}

/** The list shows exactly these todos, in order, matched by the start of each label. */
export async function expectItems(page: Page, expected: string[]) {
  await expect(page.locator(".todo-list li")).toHaveCount(expected.length);
  const labels = await titles(page);
  expected.forEach((title, i) => expect(labels[i].trim().startsWith(title)).toBe(true));
}

export async function destroy(page: Page, title: string) {
  const li = item(page, title);
  await li.hover();
  await li.locator(".destroy").click();
}

export async function toggle(page: Page, title: string) {
  await item(page, title).locator(".toggle").click();
}

export async function storedTodos(page: Page): Promise<Array<Record<string, unknown>> | null> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, STORAGE_KEY);
}

function escape(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
