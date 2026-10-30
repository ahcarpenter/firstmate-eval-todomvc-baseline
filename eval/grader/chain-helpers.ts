import { expect, type Page } from "@playwright/test";
import { addTodos, item, newTodo, openApp } from "./helpers";

// 10:00 on 5 November in Los Angeles; the chain's date tests run there.
export const MORNING = "2026-11-05T18:00:00Z";

export async function addWithDue(page: Page, title: string, due: string) {
  await page.getByLabel("Due date", { exact: true }).fill(due);
  await newTodo(page).fill(title);
  await newTodo(page).press("Enter");
  await expect(item(page, title)).toHaveCount(1);
}

export async function addUndated(page: Page, ...titles: string[]) {
  await page.getByLabel("Due date", { exact: true }).fill("");
  await addTodos(page, ...titles);
}

/** Open the app at MORNING with Late (3 Nov), Today (5 Nov), Later (10 Nov), and Undated. */
export async function datedSetup(page: Page, now = MORNING) {
  await page.clock.setFixedTime(new Date(now));
  await openApp(page);
  await addWithDue(page, "Later", "2026-11-10");
  await addUndated(page, "Undated");
  await addWithDue(page, "Late", "2026-11-03");
  await addWithDue(page, "Today", "2026-11-05");
}

export async function trimmedTitles(page: Page) {
  return (await page.locator(".todo-list li label").allTextContents()).map((t) => t.trim());
}

/** The list shows exactly these todos, in order, by the start of each label. */
export async function expectOrder(page: Page, expected: string[]) {
  await expect(page.locator(".todo-list li")).toHaveCount(expected.length);
  const labels = await trimmedTitles(page);
  expect(labels.map((label, i) => label.startsWith(expected[i]))).toEqual(expected.map(() => true));
}
