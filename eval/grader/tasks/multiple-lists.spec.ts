import { expect, test, type Page } from "@playwright/test";
import { addTodos, openApp, seedStorage, STORAGE_KEY, titles, toggle } from "../helpers";

const LIST_URL = /\/lists\/[^/]+$/;

async function seedOldTodos(page: Page) {
  await seedStorage(page, {
    [STORAGE_KEY]: [
      { id: 1, title: "Old one", completed: false },
      { id: 2, title: "Old two", completed: true },
    ],
  });
}

function listLink(page: Page, name: string) {
  return page.getByRole("link", { name, exact: true });
}

async function createList(page: Page, name: string) {
  const before = page.url();
  await page.getByLabel("New list name").fill(name);
  await page.getByLabel("New list name").press("Enter");
  await expect(page).not.toHaveURL(before);
  await expect(page).toHaveURL(LIST_URL);
  await page.waitForLoadState("networkidle");
  return page.url();
}

test("keeps existing todos in a list called Todos", async ({ page }) => {
  await seedOldTodos(page);
  await openApp(page);
  await expect(page).toHaveURL(/\/$|\/lists\/[^/]+$/);
  await expect(page.locator(".todo-list li label")).toHaveText(["Old one", "Old two"]);
  await expect(page.getByText("Todos", { exact: true }).first()).toBeVisible();
});

test("creates a list from the New list name field and switches to it", async ({ page }) => {
  await seedOldTodos(page);
  await openApp(page);
  const first = page.url();
  const work = await createList(page, "Work");
  expect(work).not.toBe(first);
  await expect(page.locator(".todo-list li")).toHaveCount(0);
  await expect(listLink(page, "Work")).toBeVisible();
});

test("keeps each list's todos separate", async ({ page }) => {
  await seedOldTodos(page);
  await openApp(page);
  await createList(page, "Work");
  await addTodos(page, "Email boss");
  await listLink(page, "Todos").click();
  await expect(page.locator(".todo-list li label")).toHaveText(["Old one", "Old two"]);
  await listLink(page, "Work").click();
  await expect(page.locator(".todo-list li label")).toHaveText(["Email boss"]);
});

test("filters each list through its own URLs", async ({ page }) => {
  await openApp(page);
  const work = await createList(page, "Work");
  await addTodos(page, "Write report", "Book flights");
  await toggle(page, "Book flights");
  await openApp(page, `${new URL(work).pathname}/active`);
  await expect(page.locator(".todo-list li label")).toHaveText(["Write report"]);
  await openApp(page, `${new URL(work).pathname}/completed`);
  await expect(page.locator(".todo-list li label")).toHaveText(["Book flights"]);
  await expect(page.locator(".filters").getByRole("link", { name: "Active" })).toHaveAttribute(
    "href",
    `${new URL(work).pathname}/active`,
  );
});

test("counts items left per list", async ({ page }) => {
  await seedOldTodos(page);
  await openApp(page);
  await expect(page.locator(".todo-count")).toHaveText(/1 item left/);
  await createList(page, "Work");
  await addTodos(page, "A", "B", "C");
  await expect(page.locator(".todo-count")).toHaveText(/3 items left/);
});

test("keeps lists and their todos across a reload", async ({ page }) => {
  await seedOldTodos(page);
  await openApp(page);
  const work = await createList(page, "Work");
  await addTodos(page, "Email boss");
  await page.reload();
  await openApp(page, new URL(work).pathname);
  await expect(page.locator(".todo-list li label")).toHaveText(["Email boss"]);
  await listLink(page, "Todos").click();
  await expect(page.locator(".todo-list li label")).toHaveText(["Old one", "Old two"]);
});

test("the root URL opens the first list", async ({ page }) => {
  await seedOldTodos(page);
  await openApp(page);
  const first = page.url();
  await createList(page, "Work");
  await openApp(page, "/");
  await expect(page).toHaveURL(first);
});

test("a new visitor can use the app right away @edge", async ({ page }) => {
  await openApp(page);
  await addTodos(page, "First");
  await page.reload();
  await openApp(page, new URL(page.url()).pathname);
  expect(await titles(page)).toEqual(["First"]);
});
