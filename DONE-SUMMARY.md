"Clear completed" now offers the same 5-second undo as a delete, and undoing brings back every cleared todo in its original place, still completed. It's committed as `273e31d` on `fm/undo-delete-followup-r3`, a clean fast-forward from `main`, and the `done` status is appended. Lint, typecheck, 17 unit tests and 10 Playwright e2e tests all pass, and the worktree is clean.

- **Undo state:** the pending undo now holds a list of removed todos with their positions (`components/TodoApp.tsx`), using new `removeCompleted` and `restoreTodos` helpers in `lib/todos.ts`. A single delete is just a list of one.
- **Ids:** a todo added during the undo window can't reuse the id of any cleared todo. An e2e test covers this.
- **Prompt text:** `Deleted 2 todos` when several were cleared, and the existing `Deleted “title”` when only one was (`components/UndoDelete.tsx`).
- **Tests and docs:** I added `e2e/undo-clear-completed.spec.ts`, which also covers clearing from `/completed` until the list is empty, surviving a reload after undo, and expiry after 5 seconds. Unit tests are extended and the README layout line is updated.

**Only one undo at a time:** clearing during another undo window replaces the pending undo, so the earlier delete becomes permanent. A delete during a clear's undo window does the same to the clear. This matches how two deletes in a row already behaved, so I kept it.
