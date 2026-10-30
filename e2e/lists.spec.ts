import { expect, test } from "@playwright/test";

async function addTodo(page: import("@playwright/test").Page, title: string) {
  const input = page.getByPlaceholder("What needs to be done?");
  await input.fill(title);
  await input.press("Enter");
}

test("keeps todos saved before lists existed in a list called Todos", async ({ page }) => {
  await page.addInitScript(() => {
    if (!window.localStorage.getItem("todolists-nextjs")) {
      window.localStorage.setItem(
        "todos-nextjs",
        JSON.stringify([
          { id: 1, title: "Buy milk", completed: false },
          { id: 2, title: "Walk the dog", completed: true },
        ]),
      );
    }
  });
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Todos" })).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk", "Walk the dog"]);
  await expect(page.locator(".todo-count")).toHaveText("1 item left");
});

test("creates, switches, and filters separate lists", async ({ page }) => {
  await page.goto("/");
  await addTodo(page, "Buy milk");

  const newList = page.getByLabel("New list name");
  await newList.fill("Work");
  await newList.press("Enter");
  await expect(page).toHaveURL("/lists/2");
  await expect(page.getByRole("link", { name: "Work" })).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".todo-list li")).toHaveCount(0);

  await addTodo(page, "Write report");
  await addTodo(page, "Send email");
  await page.locator(".todo-list li", { hasText: "Send email" }).locator(".toggle").check();
  await expect(page.locator(".todo-count")).toHaveText("1 item left");

  await page.getByRole("link", { name: "Completed" }).click();
  await expect(page).toHaveURL("/lists/2/completed");
  await expect(page.locator(".todo-list li")).toHaveText(["Send email"]);

  await page.getByRole("link", { name: "Active" }).click();
  await expect(page).toHaveURL("/lists/2/active");
  await expect(page.locator(".todo-list li")).toHaveText(["Write report"]);

  await page.getByRole("link", { name: "Todos" }).click();
  await expect(page).toHaveURL("/lists/1");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk"]);
  await expect(page.locator(".todo-count")).toHaveText("1 item left");

  await page.goto("/lists/2/completed");
  await expect(page.locator(".todo-list li")).toHaveText(["Send email"]);

  await page.goto("/");
  await expect(page.locator(".todo-list li")).toHaveText(["Buy milk"]);
});

test("shows not found for an unknown list", async ({ page }) => {
  await page.goto("/lists/99");
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});
