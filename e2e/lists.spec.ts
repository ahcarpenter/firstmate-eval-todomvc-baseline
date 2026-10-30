import { expect, test } from "@playwright/test";

async function addTodo(page: import("@playwright/test").Page, title: string) {
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill(title);
  await input.press("Enter");
}

async function createList(page: import("@playwright/test").Page, name: string) {
  const input = page.getByLabel("New list name");
  await input.fill(name);
  await input.press("Enter");
}

test("keeps todos saved before lists existed in a Todos list", async ({ page }) => {
  await page.addInitScript(() => {
    if (!window.localStorage.getItem("todos-nextjs-lists")) {
      window.localStorage.setItem(
        "todos-nextjs",
        JSON.stringify([
          { id: 1, title: "Old todo", completed: false },
          { id: 2, title: "Old done", completed: true },
        ]),
      );
    }
  });
  await page.goto("/");
  await expect(page.locator(".todo-list li")).toHaveText(["Old todo", "Old done"]);
  await expect(page.getByRole("link", { name: "Todos" })).toHaveAttribute("href", "/lists/todos");
  await page.reload();
  await expect(page.locator(".todo-list li")).toHaveText(["Old todo", "Old done"]);
});

test("creates lists, switches between them, and filters within one", async ({ page }) => {
  await page.goto("/");
  await addTodo(page, "Buy milk");

  await createList(page, "Work");
  await expect(page).toHaveURL("/lists/work");
  await expect(page.locator(".todo-list li")).toHaveCount(0);
  await addTodo(page, "Write report");
  await addTodo(page, "Send invoice");
  await page.locator(".todo-list li").filter({ hasText: "Send invoice" }).locator(".toggle").check();
  await expect(page.locator(".todo-count")).toHaveText("1 item left");

  await page.getByRole("link", { name: "Active" }).click();
  await expect(page).toHaveURL("/lists/work/active");
  await expect(page.locator(".todo-list li")).toHaveText(["Write report"]);
  await page.getByRole("link", { name: "Completed" }).click();
  await expect(page).toHaveURL("/lists/work/completed");
  await expect(page.locator(".todo-list li")).toHaveText(["Send invoice"]);

  await page.getByRole("link", { name: "Todos" }).click();
  await expect(page).toHaveURL("/lists/todos");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk"]);
  await expect(page.locator(".todo-count")).toHaveText("1 item left");

  await page.goto("/lists/work/completed");
  await expect(page.locator(".todo-list li")).toHaveText(["Send invoice"]);

  await page.goto("/");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk"]);
});

test("renames a list with Enter and cancels with Escape", async ({ page }) => {
  await page.goto("/");
  await createList(page, "Work");

  await page.getByRole("button", { name: "Rename Work" }).click();
  const field = page.getByLabel("New name for Work");
  await expect(field).toBeFocused();
  await expect(field).toHaveValue("Work");
  await field.fill("Office");
  await field.press("Escape");
  await expect(page.getByRole("link", { name: "Work" })).toBeVisible();

  await page.getByRole("button", { name: "Rename Work" }).click();
  await page.getByLabel("New name for Work").fill("Office");
  await page.getByLabel("New name for Work").press("Enter");
  await expect(page.getByRole("link", { name: "Office" })).toHaveAttribute("href", "/lists/work");
  await expect(page.getByRole("button", { name: "Rename Office" })).toBeVisible();
  await expect(page.locator(".list-name")).toHaveText("Office");

  await page.reload();
  await expect(page.getByRole("link", { name: "Office" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Work" })).toHaveCount(0);
});

test("deletes lists after confirming and keeps the last one", async ({ page }) => {
  await page.goto("/");
  await createList(page, "Work");
  await addTodo(page, "Write report");
  await createList(page, "Home");

  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "Delete Work" }).click();
  await expect(page.getByRole("link", { name: "Work" })).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete Work" }).click();
  await expect(page.getByRole("link", { name: "Work" })).toHaveCount(0);
  await expect(page).toHaveURL("/lists/home");

  await page.goto("/lists/home");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete Home" }).click();
  await expect(page).toHaveURL("/lists/todos");
  await expect(page.locator(".list-name")).toHaveText("Todos");
  await expect(page.getByRole("button", { name: "Delete Todos" })).toBeDisabled();

  await page.reload();
  await expect(page.locator(".lists li")).toHaveCount(1);
  await page.goto("/lists/work");
  await expect(page.locator(".list-missing")).toBeVisible();
});
