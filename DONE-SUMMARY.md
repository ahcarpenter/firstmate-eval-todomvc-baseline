When you delete a todo, the app now shows a "Deleted "…"" bar with an **Undo** button for 5 seconds, and Undo puts the todo back where it was. It's committed as `157a134` on `fm/undo-delete-r3`, which sits directly on top of `main` so it can merge as a fast-forward. Nothing was pushed, and I reported `done` to the status file.

**What changed**
- **Undo bar:** `components/UndoDelete.tsx` is fixed to the bottom of the page. It still appears after you delete the last todo, when the list's footer disappears.
- **One undo at a time:** a second delete replaces the first one's Undo, and the first delete becomes permanent.
- **Id fix:** new todo ids used to be "number of todos + 1", so they could repeat after any delete. That would let a restored todo share an id with one added in the meantime, and toggling one would toggle both. New ids now go one past the highest id, counting the todo still waiting for undo.
- **Lists:** `lib/todos.ts` has new `removeTodo` and `restoreTodo` helpers.
- **Tests:** unit tests for the new helpers and the id fix, and `e2e/undo-delete.spec.ts` for the browser behaviour.
- **README:** one new line in the file list.

**Checks:** lint, typecheck, 12 unit tests and 5 browser tests all pass. The browser tests cover restoring in place (including after a reload), undoing the last todo, the id fix, and the bar going away after 5 seconds. The test log is in `home/data/undo-delete-r3/`, and the worktree is clean. I didn't look at the bar's styling in a real browser beyond the automated tests.

**Not covered**
- "Clear completed" removes several todos at once and still has no undo.
- If the page is reloaded during the 5 seconds, the deleted todo is gone for good, because the delete is saved straight away.

The worktree is the only checkout of this repo rather than a linked worktree. It is the directory I was launched in, so I went ahead. Nothing arrived in the task inbox while I worked.
