Todos due today now show "Due today", todos due tomorrow show "Due tomorrow", and every other date keeps the "Due Nov 3" form. "Today" means the day on the person's own calendar, not the UTC date. The change is committed as `ef985f0` on `fm/due-soon-r1`. Lint, typecheck, unit tests (22) and end-to-end tests (6) all pass.

- **Logic:** in `lib/todos.ts`, `formatDue` now also takes the current day. It compares that against the due date, so the result doesn't depend on time zones. Overdue todos still show their date, e.g. "Due Oct 28", next to the "Overdue" tag.
- **Wiring:** `TodoApp` already worked out the person's current day for the overdue check. It now passes that same value to each `TodoItem`, so both use the same day.
- **Tests:** the unit tests cover today, tomorrow, other dates, and the step to tomorrow at the end of a month, a year, and February in leap and normal years. I added one end-to-end test with the clock set to 23:30 local time, when the UTC date may already be the next day. It checks for "Due today", "Due tomorrow" and "Due Oct 31".

The branch is a clean fast-forward from `main`, nothing was pushed, the worktree is clean, and I appended `done: ready in branch fm/due-soon-r1` to the status file. There were no messages in the steering inbox.

One thing to check on the isolation step: `git worktree list` shows this directory as the repo's only worktree. It matches the folder I was launched in and was on a detached HEAD as the brief described, so I went ahead. If firstmate expected a separate pool slot here, that's worth confirming.
