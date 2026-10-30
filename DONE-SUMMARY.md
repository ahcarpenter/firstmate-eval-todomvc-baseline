After you delete a todo, a toast now offers Undo for 5 seconds, and undo puts the todo back where it was. It's committed on `fm/undo-delete-r2` (f924652) and the status file now reads `done`. Lint, typecheck, unit tests (11 passed) and Playwright end-to-end tests (4 passed) all pass.

**How it behaves:**
- The toast reads `Deleted "<title>"` with an Undo button and sits at the bottom of the screen. Screen readers announce it.
- Only the latest delete can be undone. Deleting a second todo replaces the first offer, and the first deletion becomes permanent.
- Once the 5 seconds pass, or if the page is reloaded during them, the deletion is permanent.
- Clearing an edit to empty text deletes the todo, so that is undoable too. "Clear completed" is not undoable, since the request was about deleting a single todo.

**One extra fix:** new todo ids were `list length + 1`, so after a delete a new todo could get the same id as one already in the list. Undo would make that worse, so ids now come from the highest existing id plus one. If a restored todo's old id has been taken in the meantime, it gets a new one.

**Changes:**
- `components/TodoApp.tsx`: the undo state, timer and toast.
- `lib/todos.ts`: the id fix and a `restoreTodo` helper, with unit tests in `lib/todos.test.ts`.
- `app/globals.css`: toast styling, imported from `app/layout.tsx`.
- `e2e/undo-delete.spec.ts`: covers undo restoring the todo in place, the offer expiring at 5 seconds, and a second delete replacing the first.

**Setup:** `git worktree list` shows only one worktree, which is the directory I was launched in, so I went ahead. Per the brief's path check, firstmate should confirm this isn't its primary checkout.

**Inboxes:** my task inbox was empty. I left the launch message in the operational inbox because the brief only authorizes me to move messages in my task inbox.

Nothing was pushed or merged, and the worktree is clean. `main` hasn't moved, so the branch will merge as a fast-forward.
