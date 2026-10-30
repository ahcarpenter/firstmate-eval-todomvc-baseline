Each todo now has a "Duplicate" button next to its delete button. Clicking it puts a copy right below the original, with the same title and not completed. The work is committed on `fm/fix-duplicate-ids-followup-r1` as `ede1884`, which fast-forwards from `main`. I wrote `done` to the status file, and the steering inbox is empty.

**Checks:** lint, typecheck, the 12 unit tests and the 2 Playwright end-to-end tests all pass. The new end-to-end test duplicates a completed todo and checks three things:
- the copy appears right below the original and is not completed;
- ticking or unticking the copy leaves the original alone;
- the copy is still there after a page reload.

I didn't look at the button in a browser, so its placement and styling haven't been checked by eye.

**What changed:**
- **`lib/todos.ts`:** a new `duplicateTodo(todos, id)` makes the copy with a fresh id from the existing `nextId`. That way the copy is a separate todo and doesn't hit the shared-id bug the previous commit fixed. Two unit tests cover it.
- **`components/TodoItem.tsx` / `TodoApp.tsx`:** the new button and its click handler. Saving uses the existing `localStorage` save, so copies are kept across reloads with no extra work.
- **`app/globals.css`** (new, loaded from `app/layout.tsx`): like the delete button, the Duplicate button shows when you hover over a todo, to the left of the delete button. I made the todo text stop further from the right edge so it doesn't run under the buttons.
- **`README.md`:** the `TodoItem.tsx` line now mentions the new button.

**Decision for you:** on my first try the button had "Duplicate" as plain text, and that broke the existing "adds a todo" test. The text was being counted as part of each todo's title. So I followed the delete button's approach: the word is drawn by the stylesheet, and screen readers still announce the button as "Duplicate". If you'd rather have plain text in the button, the tests would need to check only the todo titles.
