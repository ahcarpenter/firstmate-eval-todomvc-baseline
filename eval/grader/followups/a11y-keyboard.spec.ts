import { expect, test, type Locator, type Page } from "@playwright/test";
import { addTodos, item, openApp } from "../helpers";

// The ask names the control "Important" and leaves its role open: a toggle button
// with aria-pressed, a checkbox, or a switch.
function important(page: Page, title: string) {
  const li = item(page, title);
  return li
    .getByRole("button", { name: /important/i })
    .or(li.getByRole("checkbox", { name: /important/i }))
    .or(li.getByRole("switch", { name: /important/i }));
}
const isOn = (control: Locator) =>
  control.evaluate(
    (el) =>
      el.getAttribute("aria-pressed") === "true" ||
      el.getAttribute("aria-checked") === "true" ||
      (el instanceof HTMLInputElement && el.checked),
  );

test.beforeEach(async ({ page }) => {
  await openApp(page);
  await addTodos(page, "Buy milk", "Walk the dog");
});

test("each todo has an Important toggle that starts off", async ({ page }) => {
  for (const title of ["Buy milk", "Walk the dog"]) {
    await expect(important(page, title)).toHaveCount(1);
    expect(await isOn(important(page, title))).toBe(false);
  }
});

test("the toggle can be reached with Tab and is visible when focused", async ({ page }) => {
  const control = important(page, "Buy milk");
  await page.locator(".new-todo").focus();
  let reached = false;
  for (let i = 0; i < 20 && !reached; i++) {
    await page.keyboard.press("Tab");
    reached = await control.evaluate((el) => el === document.activeElement);
  }
  expect(reached).toBe(true);
  await expect(control).toBeVisible();
});

test("Space on the focused toggle marks the todo important and announces it", async ({ page }) => {
  const control = important(page, "Buy milk");
  await control.focus();
  await page.keyboard.press("Space");
  await expect.poll(() => isOn(control)).toBe(true);
  expect(await isOn(important(page, "Walk the dog"))).toBe(false);
  await page.keyboard.press("Space");
  await expect.poll(() => isOn(control)).toBe(false);
});

test("important marks are kept across a reload", async ({ page }) => {
  await important(page, "Walk the dog").focus();
  await page.keyboard.press("Space");
  await expect.poll(() => isOn(important(page, "Walk the dog"))).toBe(true);
  await page.reload();
  await openApp(page);
  await expect.poll(() => isOn(important(page, "Walk the dog"))).toBe(true);
  expect(await isOn(important(page, "Buy milk"))).toBe(false);
});
