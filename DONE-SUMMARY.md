You can now change a todo's due date while editing it. The work is committed as `e9af770` on branch `fm/edit-due-date-r1`, sits directly on top of `main` so it will merge cleanly, and I've reported `done` to firstmate. Lint, typecheck, unit tests (16) and the end-to-end tests (4) all pass.

**How it behaves:**
- Double-clicking a todo now shows a "Change date" field next to the title, holding its current due date.
- Pressing Enter in either field saves both the title and the date.
- Escape cancels changes to both.
- Clearing the date field and saving removes the due date.
- The "Overdue" tag and the footer overdue count follow the new date right away.
- Moving focus from the title field to the date field keeps the todo open for editing. Before, the title field saved as soon as it lost focus, so tabbing to the date field would have closed the edit.

**Changes:**
- `components/TodoItem.tsx`: adds the date field and passes the date along when saving.
- `components/TodoApp.tsx`: saves the date, or removes it when it's empty.
- `app/due-dates.css`: puts the title and date fields side by side.
- `e2e/smoke.spec.ts`: one new test covering Enter, Escape, clearing the date, overdue marking, and persistence after a reload.

The layout change hasn't been checked in a real browser. The tests confirm the fields work but not how the row looks. Firstmate's inbox was empty, and I didn't push or open a PR.
