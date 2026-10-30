import { expect, test, type Page } from "@playwright/test";
import { item } from "../helpers";
import { datedSetup } from "../chain-helpers";

test.use({ timezoneId: "America/Los_Angeles" });

async function startEdit(page: Page, title: string) {
  await item(page, title).locator("label").dblclick();
  const field = page.getByLabel("Change date", { exact: true });
  await expect(field).toBeVisible();
  return field;
}

test.beforeEach(async ({ page }) => {
  await datedSetup(page);
});

test("the edit shows the todo's due date", async ({ page }) => {
  await expect(await startEdit(page, "Late")).toHaveValue("2026-11-03");
});

test("Enter in the date field saves the new date", async ({ page }) => {
  const field = await startEdit(page, "Late");
  await field.fill("2026-11-08");
  await field.press("Enter");
  await expect(item(page, "Late")).toContainText(/Due\s+Nov\s+8(?!\d)/);
  await expect(item(page, "Late")).not.toContainText(/overdue/i);
});

test("clearing the date removes it", async ({ page }) => {
  const field = await startEdit(page, "Later");
  await field.fill("");
  await field.press("Enter");
  await expect(page.locator(".todo-list li.editing")).toHaveCount(0);
  await expect(item(page, "Later")).not.toContainText(/Due/);
});

test("Escape cancels a date change", async ({ page }) => {
  const field = await startEdit(page, "Late");
  await field.fill("2026-11-08");
  await field.press("Escape");
  await expect(item(page, "Late")).toContainText(/Due\s+Nov\s+3(?!\d)/);
  await expect(item(page, "Late")).toContainText(/overdue/i);
});

test("an undated todo can get a date, and overdue follows it", async ({ page }) => {
  const field = await startEdit(page, "Undated");
  await field.fill("2026-11-01");
  await field.press("Enter");
  await expect(item(page, "Undated")).toContainText(/Due\s+Nov\s+1(?!\d)/);
  await expect(item(page, "Undated")).toContainText(/overdue/i);
});

test("Enter in the title field saves both", async ({ page }) => {
  const field = await startEdit(page, "Later");
  await field.fill("2026-11-12");
  const title = page.locator(".todo-list li.editing .edit").first();
  await title.fill("Much later");
  await title.press("Enter");
  await expect(item(page, "Much later")).toContainText(/Due\s+Nov\s+12(?!\d)/);
});

test("an edited date is kept across a reload", async ({ page }) => {
  const field = await startEdit(page, "Late");
  await field.fill("2026-11-08");
  await field.press("Enter");
  await expect(item(page, "Late")).toContainText(/Due\s+Nov\s+8(?!\d)/);
  await page.reload();
  await expect(item(page, "Late")).toContainText(/Due\s+Nov\s+8(?!\d)/);
});
