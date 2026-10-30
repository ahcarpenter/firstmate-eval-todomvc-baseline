Clear completed was already undoable before I started, so I made no app code changes. My commit on `fm/undo-delete-followup-r1` (`a750ff2`) only adds tests that check the requested behaviour.

**What I found:** the previous commit (`3601515`) already sends "Clear completed" through the same remove-and-undo path as deleting a single todo (`components/TodoApp.tsx`). The cleared todos come back in their original places with their completed state. The existing test checked the order after undo but not that the todos were still completed.

**What I added:**
- **`e2e/undo-delete.spec.ts`:**
  - The cleared todos come back in place among active todos, still completed and still there after a reload. The "items left" count and the undo bar going away are also checked.
  - Undo works when every todo was completed and the list was emptied.
  - The undo offer for a clear goes away after 5 seconds.
- **`lib/todos.test.ts`:** a unit test that cleared completed todos are restored exactly as they were.

Lint, typecheck, 13 unit tests and 6 end-to-end tests all pass. The working tree is clean, the branch fast-forwards onto `main`, and nothing was pushed. Firstmate's inbox message is acknowledged. I added a `resolved` line for my earlier blocker, and the `done` line is in the status file.

**Assumptions:**
- I took "use your best judgement and carry on" to mean I could work in this checkout even though it's the repo's primary checkout, not an isolated worktree. I only created and committed on the task branch and didn't touch `main`.
- A new delete or clear made while an undo is still showing replaces the earlier undo, so only the latest one can be undone. I kept that because it's how single deletes already behave, which matches "the same way as a delete".
- If todos are added before undoing, the restored ones go back at their original positions as nearly as possible. That's the existing restore logic and I didn't change it.
