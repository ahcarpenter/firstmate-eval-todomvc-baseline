The overdue feature is committed on `fm/overdue-r2` (f6b5c73). That branch is a clean fast-forward onto `main`, the worktree is clean, and I've written the `done` line to the status file.

**What it does:** a todo is overdue when it isn't completed and its due date is before today's date in the user's own time zone. A todo due today is not overdue.
- Overdue todos show a red "Overdue" label under their due date.
- There's a new "Overdue" filter link after All, Active and Completed, at `/overdue`.
- The footer shows the count next to the items-left text, for example "2 overdue". It only appears when at least one todo is overdue; with none, the footer stays as it was.

**Checks:** lint, typecheck, unit tests (13 passed) and end-to-end tests (3 passed) all pass. The new browser test fixes the date at 2026-10-30, then checks the labels, the `/overdue` filter, the count, that completing a todo removes it from the filter, and that this survives a reload. The test log is in `home/data/overdue-r2/e2e.log`.

**Files changed:**
- **Logic:** `lib/todos.ts` (new `todayKey` and `isOverdue`, and the `overdue` filter).
- **Route:** `app/[[...filter]]/page.tsx`.
- **UI:** `components/TodoApp.tsx`, `components/TodoItem.tsx` and `app/app.css`.
- **Tests:** `lib/todos.test.ts` and `e2e/smoke.spec.ts`.
- **Docs:** `README.md`, updated to list the new route.

Nothing was pushed and no PR was opened. The steering inbox had no messages.
