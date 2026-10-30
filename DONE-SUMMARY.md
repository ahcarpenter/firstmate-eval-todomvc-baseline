You can now change a todo's due date while editing it. The change is committed as `7bcfe2a` on branch `fm/edit-due-date-r3`, one commit on top of `main`, so it will merge as a fast-forward. Lint, typecheck, unit tests (14) and end-to-end tests (4, one of them new) all pass. I've recorded it as done in the status file.

**How it works:**
- Double-clicking a todo now shows a "Change date" field next to the title, holding the current due date.
- Enter in either field saves both the title and the date.
- Escape in either field cancels both.
- Clearing the date field and saving removes the due date completely.
- The Overdue marker, the overdue count and the Overdue filter all follow the new date.

**One behaviour change:** clicking away from a todo you're editing used to save it as soon as the title field lost focus. Now it saves only when you click outside both fields. Without that, moving from the title to the date field would have saved and closed the editor.

The changes are in `components/TodoItem.tsx`, `components/TodoApp.tsx` and `app/due-dates.css`, plus the new test in `e2e/smoke.spec.ts`. I also updated one line in `README.md`, which said a todo had a single edit field. I checked the layout with a screenshot, saved outside the worktree as `home/data/edit-due-date-r3/editing.png`. The worktree is clean, and nothing was pushed.

The status line I wrote when setup finished (`working`) skipped the fleet-ledger step the brief asks for after each status line. The `done` line did run it.
