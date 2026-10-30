Lists can now be renamed and deleted. The change is committed as `15bbb7d` on `fm/multiple-lists-followup-r3`, which fast-forwards onto `main`, and I reported `done` to firstmate. Lint, typecheck, the unit tests (20) and the browser tests (5) all pass. The worktree is clean and the steering inbox was empty.

**Rename:** Each list now has a "Rename Work" button that swaps the link for a field holding the name, with the cursor in it. Enter saves the new name and Escape cancels.

**Delete:** "Delete Work" asks for confirmation with the browser's dialog, then removes the list and its todos. If that list was open, the app switches to the first remaining list. When only one list is left, its Delete button is greyed out.

Renames and deletions are still there after a reload.

Choices I made where the brief didn't say:
- **The address stays the same after a rename.** A list renamed from Work to Office is still at `/lists/work`.
- **Clicking away from the rename field cancels it**, the same as Escape.
- **Pressing Enter on an empty name** leaves the name unchanged.

The changes are in `lib/todos.ts`, `components/TodoApp.tsx` and `app/lists.css`, with new tests in `lib/todos.test.ts` and `e2e/lists.spec.ts`.
