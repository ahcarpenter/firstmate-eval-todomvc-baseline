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
