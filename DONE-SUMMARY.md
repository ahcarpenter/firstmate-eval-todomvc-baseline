You can now toggle, edit and delete todos from the keyboard, and every control has a name a screen reader can announce. The change is committed on `fm/a11y-keyboard-r2` as `c507f1d`, which fast-forwards from `main`. Nothing was pushed, and I've reported `done` in the status file. Lint, typecheck, the unit tests and all 8 Playwright tests pass, including 7 new keyboard tests.

**What changed:**
- **Names:**
  - Each todo's checkbox is named by its title, and still announces whether it's checked.
  - The buttons say which todo they act on (`Edit "Buy milk"`, `Delete "Buy milk"`).
  - The new-todo field is named "New todo" and the edit field is named `Edit "<title>"`.
- **Editing:** there's a new ✎ Edit button next to Delete, and double-click still works. Enter saves and Escape cancels, and both put focus back on the Edit button.
- **Delete button:** the Edit and Delete buttons now appear when the row has keyboard focus, not only on hover. They're hidden with transparency rather than removed, so screen readers can always find them.
- **Focus rings:** the checkboxes are invisible in this stylesheet, so their focus ring is drawn on the circle and the "mark all" arrow. The new rules are in a new file, `app/globals.css`.
- **Focus after removal:** after a delete, focus moves to the next todo, or to the new-todo field if the list is empty. "Clear completed" also sends focus to the new-todo field, so it's no longer lost.

**Two behaviour changes:**
- **Blur bug fixed:** the edit field no longer saves a second time on blur after Enter or Escape. Without that guard, Escape could save your discarded text if the browser fired a blur.
- **Footer text:** it now reads "Double-click or use the Edit button to edit a todo".

The screenshot of the focused Edit button is at `home/data/a11y-keyboard-r2/focus-edit.png`. It sits next to Delete and doesn't overlap long titles.

**Two things to flag:**
- **Not a linked worktree:** `git worktree list` showed this directory is a standalone checkout. It matched the directory I was launched in, which is the brief's test, so I went ahead.
- **Existing bug, not fixed:** `nextId` in `lib/todos.ts` uses `todos.length + 1`, so a todo added after a delete can get the same id as an existing one. Then toggling or editing one also changes the other, and focus handling can pick the wrong row. It's outside this task.
