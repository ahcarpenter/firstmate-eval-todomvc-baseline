import { expect, test, type Page } from "@playwright/test";
import { addTodos, openApp, seedStorage, STORAGE_KEY } from "../helpers";

const LIST_URL = /\/lists\/[^/]+$/;
const link = (page: Page, name: string) => page.getByRole("link", { name, exact: true });
const button = (page: Page, verb: string, name: string) =>
  page.getByRole("button", { name: new RegExp(`^\\s*${verb}\\s+${name}\\s*$`, "i") });
const labels = (page: Page) => page.locator(".todo-list li label");

async function createList(page: Page, name: string) {
  const before = page.url();
  await page.getByLabel("New list name").fill(name);
  await page.getByLabel("New list name").press("Enter");
  await expect(page).not.toHaveURL(before);
  await expect(page).toHaveURL(LIST_URL);
  await page.waitForLoadState("networkidle");
  return page.url();
}
async function renameTo(page: Page, from: string, to: string) {
  await button(page, "Rename", from).click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.type(to);
  await page.keyboard.press("Enter");
}

test.beforeEach(async ({ page }) => {
  await seedStorage(page, {
    [STORAGE_KEY]: [
      { id: 1, title: "Old one", completed: false },
      { id: 2, title: "Old two", completed: true },
    ],
  });
  await openApp(page);
  await createList(page, "Work");
  await addTodos(page, "Email boss");
});

test("renames a list and keeps its todos", async ({ page }) => {
  const url = page.url();
  await renameTo(page, "Work", "Office");
  await expect(link(page, "Office")).toBeVisible();
  await expect(link(page, "Work")).toHaveCount(0);
  await link(page, "Office").click();
  await expect(page).toHaveURL(url);
  await expect(labels(page)).toHaveText(["Email boss"]);
});

test("Escape cancels a rename", async ({ page }) => {
  await button(page, "Rename", "Work").click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.type("Nope");
  await page.keyboard.press("Escape");
  await expect(link(page, "Work")).toBeVisible();
  await expect(link(page, "Nope")).toHaveCount(0);
});

test("deletes the open list and its todos after confirmation", async ({ page }) => {
  page.once("dialog", (dialog) => dialog.accept());
  await button(page, "Delete", "Work").click();
  await expect(link(page, "Work")).toHaveCount(0);
  await expect(page).toHaveURL(LIST_URL);
  await expect(labels(page)).toHaveText(["Old one", "Old two"]);
  await expect(page.getByText("Email boss")).toHaveCount(0);
});

test("dismissing the confirmation keeps the list", async ({ page }) => {
  page.once("dialog", (dialog) => dialog.dismiss());
  await button(page, "Delete", "Work").click();
  await expect(link(page, "Work")).toBeVisible();
  await expect(labels(page)).toHaveText(["Email boss"]);
});

test("the last remaining list cannot be deleted", async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
  await button(page, "Delete", "Work").click();
  await expect(link(page, "Work")).toHaveCount(0);
  const last = button(page, "Delete", "Todos");
  if ((await last.count()) > 0 && (await last.first().isEnabled())) await last.first().click();
  await expect(labels(page)).toHaveText(["Old one", "Old two"]);
  await page.reload();
  await openApp(page);
  await expect(labels(page)).toHaveText(["Old one", "Old two"]);
});

test("renames and deletions are kept across a reload", async ({ page }) => {
  await renameTo(page, "Work", "Office");
  await expect(link(page, "Office")).toBeVisible();
  await createList(page, "Home");
  page.once("dialog", (dialog) => dialog.accept());
  await button(page, "Delete", "Home").click();
  await expect(link(page, "Home")).toHaveCount(0);
  await page.reload();
  await openApp(page);
  await expect(link(page, "Office")).toBeVisible();
  await expect(link(page, "Home")).toHaveCount(0);
  await expect(link(page, "Work")).toHaveCount(0);
});
