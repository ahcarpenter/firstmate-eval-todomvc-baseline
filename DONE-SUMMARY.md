Undo for deletes is in, committed on `fm/undo-delete-r1` as `3601515`, and I've reported `done` to firstmate. It applies directly on top of `main`, and nothing was pushed.

**What users see:** after deleting a todo, a dark bar appears below the list saying `Deleted "Buy milk"` with an **Undo** button. It goes away after 5 seconds. Clicking Undo puts the todo back where it was, and it is still there after a reload.

**Choices I made beyond the brief:**
- **Other ways to delete:** emptying a todo's title while editing also deletes it, so it gets the same undo bar. "Clear completed" does too, and its bar says `Deleted 2 todos`.
- **Only the latest delete:** a second delete replaces the bar, so only the most recent one can be undone.

**An existing bug I fixed:** new todos got their id from the list length, so after a delete a new todo could share an id with an old one. Undo would have made that much easier to hit. New ids now come from the highest existing id, and todos waiting to be undone are counted too.

**Checks:** lint, typecheck and all 12 unit tests pass. All 4 end-to-end tests pass, including new ones for undoing in place, undoing "Clear completed", and the bar expiring at 5 seconds. I also took a screenshot to check the bar looks right.

**Files changed:**
- `components/TodoApp.tsx`: the undo bar and the 5-second timer.
- `lib/todos.ts`: new helpers to remove todos and put them back in place.
- `lib/todos.test.ts` and the new `e2e/undo-delete.spec.ts`: tests.
- `README.md`: a one-line note on the feature.

The screenshot is in the task data folder as `undo.png`.
