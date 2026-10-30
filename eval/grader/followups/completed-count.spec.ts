import { expect, test, type Page } from "@playwright/test";
import { addTodos, openApp, toggle } from "../helpers";

const bar = (page: Page) => page.getByRole("progressbar").first();
const share = (page: Page) =>
  bar(page).evaluate((el) => {
    if (el instanceof HTMLProgressElement) return el.value / el.max;
    const min = Number(el.getAttribute("aria-valuemin") ?? 0);
    const max = Number(el.getAttribute("aria-valuemax") ?? 100);
    return (Number(el.getAttribute("aria-valuenow")) - min) / (max - min);
  });
// The percentage may be visible text or the bar's own label.
async function labelled(page: Page, percent: number) {
  const pattern = new RegExp(`(?<!\\d)${percent}\\s*%\\s*complete`, "i");
  if (pattern.test(await page.locator("body").innerText())) return true;
  if ((await page.getByRole("progressbar", { name: pattern }).count()) > 0) return true;
  return pattern.test((await bar(page).getAttribute("aria-valuetext")) ?? "");
}
const hidden = async (page: Page) =>
  (await page.getByRole("progressbar").count()) === 0 || !(await bar(page).isVisible());

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await addTodos(page, "One", "Two", "Three", "Four", "Five");
});

test("shows the share completed as a progress bar", async ({ page }) => {
  await toggle(page, "One");
  await toggle(page, "Two");
  await expect.poll(() => share(page)).toBeCloseTo(0.4, 2);
});

test("labels the bar with the percentage", async ({ page }) => {
  await toggle(page, "One");
  await toggle(page, "Two");
  await expect.poll(() => labelled(page, 40)).toBe(true);
});

test("updates when todos are checked and unchecked", async ({ page }) => {
  await toggle(page, "One");
  await toggle(page, "Two");
  await toggle(page, "Three");
  await expect.poll(() => share(page)).toBeCloseTo(0.6, 2);
  await toggle(page, "Three");
  await expect.poll(() => share(page)).toBeCloseTo(0.4, 2);
});

test("mark all as complete fills the bar", async ({ page }) => {
  await page.locator(".toggle-all").check({ force: true });
  await expect.poll(() => share(page)).toBeCloseTo(1, 2);
  await expect.poll(() => labelled(page, 100)).toBe(true);
});

test("hides the bar when the list is empty", async ({ page }) => {
  await page.locator(".toggle-all").check({ force: true });
  await page.locator(".clear-completed").click();
  await expect(page.locator(".todo-list li")).toHaveCount(0);
  await expect.poll(() => hidden(page)).toBe(true);
});
