import { expect, test } from "@playwright/test";
import { addTodos, destroy, item, newTodo, openApp, titles, toggle } from "./helpers";

// The TodoMVC behavior every run must keep (https://github.com/tastejs/todomvc/blob/master/app-spec.md).
// It drives the app only through the TodoMVC template's markup and never reads storage directly.

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test.describe("regression: no todos", () => {
  test("focuses the new todo field on load", async ({ page }) => {
    await expect(newTodo(page)).toBeFocused();
  });

  test("hides the main section and footer", async ({ page }) => {
    await expect(page.locator(".main")).toBeHidden();
    await expect(page.locator(".footer")).toBeHidden();
  });
});

test.describe("regression: new todo", () => {
  test("adds todos to the bottom of the list and clears the field", async ({ page }) => {
    await addTodos(page, "Buy milk", "Walk the dog");
    expect(await titles(page)).toEqual(["Buy milk", "Walk the dog"]);
    await expect(newTodo(page)).toHaveValue("");
    await expect(page.locator(".main")).toBeVisible();
    await expect(page.locator(".footer")).toBeVisible();
  });

  test("trims the title and ignores empty input", async ({ page }) => {
    await addTodos(page, "   Buy milk   ");
    await newTodo(page).fill("    ");
    await newTodo(page).press("Enter");
    expect(await titles(page)).toEqual(["Buy milk"]);
  });
});

test.describe("regression: mark all as complete", () => {
  test("marks every todo complete and clears it again", async ({ page }) => {
    await addTodos(page, "One", "Two", "Three");
    await page.locator(".toggle-all").check({ force: true });
    await expect(page.locator(".todo-list li.completed")).toHaveCount(3);
    await page.locator(".toggle-all").uncheck({ force: true });
    await expect(page.locator(".todo-list li.completed")).toHaveCount(0);
  });

  test("follows the state of the individual todos", async ({ page }) => {
    await addTodos(page, "One", "Two");
    await toggle(page, "One");
    await expect(page.locator(".toggle-all")).not.toBeChecked();
    await toggle(page, "Two");
    await expect(page.locator(".toggle-all")).toBeChecked();
    await toggle(page, "Two");
    await expect(page.locator(".toggle-all")).not.toBeChecked();
  });
});

test.describe("regression: item", () => {
  test("marks a todo complete and active again", async ({ page }) => {
    await addTodos(page, "One", "Two");
    await toggle(page, "One");
    await expect(item(page, "One")).toHaveClass(/completed/);
    await expect(item(page, "Two")).not.toHaveClass(/completed/);
    await toggle(page, "One");
    await expect(item(page, "One")).not.toHaveClass(/completed/);
  });

  test("deletes a todo from its delete button", async ({ page }) => {
    await addTodos(page, "One", "Two", "Three");
    await destroy(page, "Two");
    expect(await titles(page)).toEqual(["One", "Three"]);
  });
});

test.describe("regression: editing", () => {
  test("double-click opens the edit field with the title and hides the other controls", async ({ page }) => {
    await addTodos(page, "One", "Two");
    await item(page, "Two").locator("label").dblclick();
    const li = page.locator(".todo-list li.editing");
    await expect(li).toHaveCount(1);
    await expect(li.locator(".edit")).toBeVisible();
    await expect(li.locator(".edit")).toHaveValue("Two");
    await expect(li.locator(".edit")).toBeFocused();
    await expect(li.locator(".toggle")).toBeHidden();
  });

  test("saves on Enter and trims the title", async ({ page }) => {
    await addTodos(page, "One", "Two");
    await item(page, "Two").locator("label").dblclick();
    await page.locator(".todo-list li.editing .edit").fill("   Two edited   ");
    await page.locator(".todo-list li.editing .edit").press("Enter");
    expect(await titles(page)).toEqual(["One", "Two edited"]);
    await expect(page.locator(".todo-list li.editing")).toHaveCount(0);
  });

  test("saves on blur", async ({ page }) => {
    await addTodos(page, "One", "Two");
    await item(page, "Two").locator("label").dblclick();
    await page.locator(".todo-list li.editing .edit").fill("Two blurred");
    await page.locator(".todo-list li.editing .edit").blur();
    expect(await titles(page)).toEqual(["One", "Two blurred"]);
  });

  test("removes the todo when the title is cleared", async ({ page }) => {
    await addTodos(page, "One", "Two");
    await item(page, "Two").locator("label").dblclick();
    await page.locator(".todo-list li.editing .edit").fill("   ");
    await page.locator(".todo-list li.editing .edit").press("Enter");
    expect(await titles(page)).toEqual(["One"]);
  });

  test("cancels on Escape", async ({ page }) => {
    await addTodos(page, "One", "Two");
    await item(page, "Two").locator("label").dblclick();
    await page.locator(".todo-list li.editing .edit").fill("Changed");
    await page.locator(".todo-list li.editing .edit").press("Escape");
    expect(await titles(page)).toEqual(["One", "Two"]);
    await expect(page.locator(".todo-list li.editing")).toHaveCount(0);
  });
});

test.describe("regression: counter", () => {
  test("counts active todos with the right plural", async ({ page }) => {
    await addTodos(page, "One");
    await expect(page.locator(".todo-count")).toHaveText(/^\s*1 item left(?![a-z])/);
    await addTodos(page, "Two");
    await expect(page.locator(".todo-count")).toHaveText(/^\s*2 items left(?![a-z])/);
    await toggle(page, "One");
    await toggle(page, "Two");
    await expect(page.locator(".todo-count")).toHaveText(/^\s*0 items left(?![a-z])/);
  });
});

test.describe("regression: clear completed", () => {
  test("is shown only when something is completed and removes completed todos", async ({ page }) => {
    await addTodos(page, "One", "Two", "Three");
    await expect(page.locator(".clear-completed")).toBeHidden();
    await toggle(page, "Two");
    await expect(page.locator(".clear-completed")).toBeVisible();
    await page.locator(".clear-completed").click();
    expect(await titles(page)).toEqual(["One", "Three"]);
    await expect(page.locator(".clear-completed")).toBeHidden();
  });
});

test.describe("regression: persistence", () => {
  test("keeps titles and completed state across a reload", async ({ page }) => {
    await addTodos(page, "One", "Two");
    await toggle(page, "Two");
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".todo-list li label")).toHaveText(["One", "Two"]);
    await expect(item(page, "Two")).toHaveClass(/completed/);
    await expect(item(page, "One")).not.toHaveClass(/completed/);
  });
});

test.describe("regression: routing", () => {
  test("filters active and completed todos through links and the URL", async ({ page }) => {
    await addTodos(page, "One", "Two", "Three");
    await toggle(page, "Two");
    await page.locator(".filters").getByRole("link", { name: "Active" }).click();
    await expect(page).toHaveURL(/\/active$/);
    await expect(page.locator(".todo-list li label")).toHaveText(["One", "Three"]);
    await expect(page.locator(".filters").getByRole("link", { name: "Active" })).toHaveClass(/selected/);
    await page.locator(".filters").getByRole("link", { name: "Completed" }).click();
    await expect(page).toHaveURL(/\/completed$/);
    await expect(page.locator(".todo-list li label")).toHaveText(["Two"]);
    await page.locator(".filters").getByRole("link", { name: "All" }).click();
    await expect(page.locator(".todo-list li label")).toHaveText(["One", "Two", "Three"]);
    await expect(page.locator(".filters").getByRole("link", { name: "All" })).toHaveClass(/selected/);
  });

  test("returns to the previous filter with the back button", async ({ page }) => {
    await addTodos(page, "One", "Two");
    await toggle(page, "Two");
    await page.locator(".filters").getByRole("link", { name: "Active" }).click();
    await expect(page.locator(".todo-list li label")).toHaveText(["One"]);
    await page.locator(".filters").getByRole("link", { name: "Completed" }).click();
    await expect(page.locator(".todo-list li label")).toHaveText(["Two"]);
    await page.goBack();
    await expect(page).toHaveURL(/\/active$/);
    await expect(page.locator(".todo-list li label")).toHaveText(["One"]);
  });

  test("hides a todo from the active view once it is completed", async ({ page }) => {
    await addTodos(page, "One", "Two");
    await page.locator(".filters").getByRole("link", { name: "Active" }).click();
    await toggle(page, "One");
    await expect(page.locator(".todo-list li label")).toHaveText(["Two"]);
  });
});
