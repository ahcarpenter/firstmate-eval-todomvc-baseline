import { expect, test } from "@playwright/test";

async function addTodo(page: import("@playwright/test").Page, title: string) {
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill(title);
  await input.press("Enter");
}

async function addList(page: import("@playwright/test").Page, name: string) {
  const input = page.getByLabel("New list name");
  await input.fill(name);
  await input.press("Enter");
}

const lists = (page: import("@playwright/test").Page) => page.getByRole("navigation", { name: "Lists" });

test("/ opens the first list", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL("/lists/1");
  await expect(lists(page).getByRole("link")).toHaveText(["Todos"]);
});

test("creating a list switches to it and keeps todos per list", async ({ page }) => {
  await page.goto("/");
  await addTodo(page, "Buy milk");

  await addList(page, "Work");
  await expect(page).toHaveURL("/lists/2");
  await expect(page.getByLabel("New list name")).toHaveValue("");
  await expect(lists(page).getByRole("link")).toHaveText(["Todos", "Work"]);
  await expect(lists(page).getByRole("link", { name: "Work" })).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".todo-list li")).toHaveCount(0);

  await addTodo(page, "Write report");
  await addTodo(page, "Email Sam");
  await page.locator(".todo-list li", { hasText: "Email Sam" }).locator(".toggle").check();
  await expect(page.locator(".todo-count")).toHaveText("1 item left");

  await page.getByRole("link", { name: "Completed" }).click();
  await expect(page).toHaveURL("/lists/2/completed");
  await expect(page.locator(".todo-list li")).toHaveText(["Email Sam"]);

  await page.getByRole("link", { name: "Active" }).click();
  await expect(page).toHaveURL("/lists/2/active");
  await expect(page.locator(".todo-list li")).toHaveText(["Write report"]);

  await lists(page).getByRole("link", { name: "Todos" }).click();
  await expect(page).toHaveURL("/lists/1");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk"]);
  await expect(page.locator(".todo-count")).toHaveText("1 item left");

  await page.goto("/lists/2/completed");
  await expect(page.locator(".todo-list li")).toHaveText(["Email Sam"]);
});

test("existing todos become a list called Todos", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem(
      "todos-nextjs",
      JSON.stringify([
        { id: 1, title: "Old todo", completed: false },
        { id: 2, title: "Done todo", completed: true },
      ]),
    );
  });
  await page.goto("/");
  await expect(page).toHaveURL("/lists/1");
  await expect(lists(page).getByRole("link")).toHaveText(["Todos"]);
  await expect(page.locator(".todo-list li")).toHaveText(["Old todo", "Done todo"]);
  await expect(page.locator(".todo-count")).toHaveText("1 item left");
});

test("renaming a list keeps the new name across reloads", async ({ page }) => {
  await page.goto("/");
  await addList(page, "Work");
  await expect(page).toHaveURL("/lists/2");

  await lists(page).getByRole("button", { name: "Rename Work" }).click();
  const field = lists(page).getByRole("textbox", { name: "Rename Work" });
  await expect(field).toBeFocused();
  await expect(field).toHaveValue("Work");
  await field.fill("Office");
  await field.press("Escape");
  await expect(lists(page).getByRole("link")).toHaveText(["Todos", "Work"]);

  await lists(page).getByRole("button", { name: "Rename Work" }).click();
  await lists(page).getByRole("textbox", { name: "Rename Work" }).fill("Office");
  await lists(page).getByRole("textbox", { name: "Rename Work" }).press("Enter");
  await expect(lists(page).getByRole("link")).toHaveText(["Todos", "Office"]);
  await expect(lists(page).getByRole("button", { name: "Rename Office" })).toBeVisible();

  await page.reload();
  await expect(lists(page).getByRole("link")).toHaveText(["Todos", "Office"]);
});

test("deleting the open list removes its todos and opens the first list", async ({ page }) => {
  await page.goto("/");
  await addTodo(page, "Buy milk");
  await addList(page, "Work");
  await addTodo(page, "Write report");

  page.once("dialog", (dialog) => dialog.dismiss());
  await lists(page).getByRole("button", { name: "Delete Work" }).click();
  await expect(lists(page).getByRole("link")).toHaveText(["Todos", "Work"]);
  await expect(page.locator(".todo-list li")).toHaveText(["Write report"]);

  page.once("dialog", (dialog) => dialog.accept());
  await lists(page).getByRole("button", { name: "Delete Work" }).click();
  await expect(page).toHaveURL("/lists/1");
  await expect(lists(page).getByRole("link")).toHaveText(["Todos"]);
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk"]);

  await page.reload();
  await expect(lists(page).getByRole("link")).toHaveText(["Todos"]);
  const stored = await page.evaluate(() => localStorage.getItem("todos-nextjs-lists"));
  expect(stored).not.toContain("Write report");
});

test("deleting another list stays on the open list", async ({ page }) => {
  await page.goto("/");
  await addList(page, "Work");
  await lists(page).getByRole("link", { name: "Todos" }).click();
  await expect(page).toHaveURL("/lists/1");

  page.once("dialog", (dialog) => dialog.accept());
  await lists(page).getByRole("button", { name: "Delete Work" }).click();
  await expect(lists(page).getByRole("link")).toHaveText(["Todos"]);
  await expect(page).toHaveURL("/lists/1");
});

test("the last list cannot be deleted", async ({ page }) => {
  await page.goto("/");
  await expect(lists(page).getByRole("button", { name: "Delete Todos" })).toBeDisabled();
});

test("an unknown list says so", async ({ page }) => {
  await page.goto("/lists/99");
  await expect(page.getByText("This list does not exist.")).toBeVisible();
  await expect(lists(page).getByRole("link")).toHaveText(["Todos"]);
});

test("an unknown filter is not found", async ({ page }) => {
  const response = await page.goto("/lists/1/everything");
  expect(response?.status()).toBe(404);
});
