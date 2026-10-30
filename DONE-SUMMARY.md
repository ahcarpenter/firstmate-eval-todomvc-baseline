You can now change a todo's due date. It's committed on `fm/edit-due-date-r2` as `81bc20c`, a clean fast-forward onto `main`, and I've reported `done` to firstmate. Lint, typecheck, the 16 unit tests and the 4 end-to-end tests all pass, including a new end-to-end test for this feature.

**How it works:**
- When you double-click a todo to edit it, a date field labelled "Change date" appears next to the title, holding the current due date.
- Pressing Enter in either field saves both the title and the date. Escape cancels both.
- Clearing the date field and saving removes the due date, and that still holds after a reload.
- Overdue marking, the overdue count and the Overdue filter all follow the new date.

**Changes I made beyond the request:**
- **Moving between fields:** before, leaving the title field saved and closed the edit. Now the edit stays open while you move between the title and date fields, and saves only when you leave both.
- **No double save:** I added a guard so a stray blur after Enter or Escape can't save again or overwrite a cancel.
- **README:** I updated the line describing `components/TodoItem.tsx` to mention the date field.

The main changes are in `components/TodoItem.tsx`, plus a small `editTodo` helper in `lib/todos.ts` that sets or removes the date. Nothing was pushed, and the worktree is clean.
