import { expect, test, type Page } from "@playwright/test";
import { addTodos, expectItems, item, newTodo, openApp } from "../helpers";

// A person in Los Angeles who picks 3 November must see 3 November.
test.use({ timezoneId: "America/Los_Angeles" });

async function addWithDue(page: Page, title: string, due: string) {
  await page.getByLabel("Due date").fill(due);
  await newTodo(page).fill(title);
  await newTodo(page).press("Enter");
  await expect(item(page, title)).toHaveCount(1);
}

// A fixed day well before the dates below, so later changes that word dates
// relative to today cannot make these tests depend on the day they are graded.
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-10-20T18:00:00Z"));
  await openApp(page);
});

test("shows the due date picked when adding a todo", async ({ page }) => {
  await addWithDue(page, "Pay rent", "2026-11-03");
  await expect(item(page, "Pay rent")).toContainText(/Due\s+Nov\s+3(?!\d)/);
});

test("a todo without a due date shows no due date", async ({ page }) => {
  await addTodos(page, "Someday");
  await expect(item(page, "Someday")).not.toContainText(/Due/);
});

test("keeps due dates across a reload", async ({ page }) => {
  await addWithDue(page, "Pay rent", "2026-11-03");
  await page.getByLabel("Due date").fill("");
  await addTodos(page, "Someday");
  await page.reload();
  await openApp(page);
  await expectItems(page, ["Pay rent", "Someday"]);
  await expect(item(page, "Pay rent")).toContainText(/Due\s+Nov\s+3(?!\d)/);
  await expect(item(page, "Someday")).not.toContainText(/Due/);
});

test("the due date is optional for the next todo", async ({ page }) => {
  await addWithDue(page, "Pay rent", "2026-11-03");
  await page.getByLabel("Due date").fill("");
  await addTodos(page, "No date");
  await expect(item(page, "No date")).not.toContainText(/Due/);
});

test("clears the date field after adding a todo @edge", async ({ page }) => {
  await addWithDue(page, "Pay rent", "2026-11-03");
  await expect(page.getByLabel("Due date")).toHaveValue("");
});

test.describe("east of UTC", () => {
  test.use({ timezoneId: "Asia/Tokyo" });
  test("shows the picked date in Tokyo too", async ({ page }) => {
    await addWithDue(page, "Pay rent", "2026-11-03");
    await page.reload();
    await openApp(page);
    await expect(item(page, "Pay rent")).toContainText(/Due\s+Nov\s+3(?!\d)/);
  });
});
