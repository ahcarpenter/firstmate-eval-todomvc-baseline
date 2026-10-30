I added renaming and deleting lists, committed it as `982ed2a` on `fm/multiple-lists-followup-r1`, and reported `done` to firstmate. Lint, typecheck, the unit tests (18) and the Playwright tests (6) all pass. The branch fast-forwards onto `main`, the worktree is clean, nothing was pushed, and the steering inbox is empty.

**What changed:**
- **Buttons:** each list in the nav now has "Rename <name>" and "Delete <name>" buttons next to its link.
- **Rename:** the link turns into a focused field holding the list's name. Enter saves a non-empty name and Escape cancels.
- **Delete:** asks with the browser's confirm dialog, then removes the list and its todos. If the open list is deleted, the app switches to the first remaining list.
- **Last list:** its Delete button is disabled, with a tooltip saying it can't be deleted.
- **Persistence:** renames and deletions are saved to localStorage and survive a reload.

The logic is in `lib/lists.ts`, the UI in `components/TodoApp.tsx`, and the styles in `app/lists.css`. The new tests are in `lib/lists.test.ts` and `e2e/lists.spec.ts`.

**Choices the brief didn't cover:**
- Clicking away from the rename field cancels the rename rather than saving it, so a name only changes when you press Enter.
- Pressing Enter with an empty name does nothing; the field stays open.
- Deleting the open list replaces the URL rather than adding a history entry, so Back doesn't land on a "not found" page. Any Active/Completed filter is dropped when it switches lists.
- List ids still come from the highest existing id. If you delete the newest list, the next list you create reuses its id and URL.
