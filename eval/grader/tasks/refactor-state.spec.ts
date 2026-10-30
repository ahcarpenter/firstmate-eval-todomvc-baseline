import { expect, test } from "@playwright/test";
import { addTodos, item, openApp, seedStorage, STORAGE_KEY, storedTodos } from "../helpers";

test("loads todos saved by the previous version", async ({ page }) => {
  await seedStorage(page, {
    [STORAGE_KEY]: [
      { id: 1, title: "Saved", completed: true },
      { id: 2, title: "Other", completed: false },
    ],
  });
  await openApp(page);
  await expect(page.locator(".todo-list li label")).toHaveText(["Saved", "Other"]);
  await expect(item(page, "Saved")).toHaveClass(/completed/);
  await expect(page.locator(".todo-count")).toHaveText(/1 item left/);
});

test("saves todos in the format the previous version reads", async ({ page }) => {
  await openApp(page);
  await addTodos(page, "Kept");
  await expect.poll(async () => (await storedTodos(page))?.length ?? 0).toBe(1);
  const [saved] = (await storedTodos(page)) ?? [];
  expect(saved).toMatchObject({ title: "Kept", completed: false });
  expect(typeof saved.id).toBe("number");
});
