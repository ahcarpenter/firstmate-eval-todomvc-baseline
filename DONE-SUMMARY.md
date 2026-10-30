Todos due today now show "Due today", and todos due tomorrow show "Due tomorrow". Other dates still show "Due Nov 3". The change is committed on `fm/due-soon-r3` as `8f84d48`, one commit ahead of `main`, so it will merge as a fast-forward. Typecheck, lint, the unit tests (18) and the browser tests (6) all pass.

- **Calendar:** "today" is the date on the person's own clock. "Tomorrow" is the next calendar day after that, correct across month ends, year ends, leap days and clock changes. The fix is in `formatDueDate` in `lib/todos.ts`, which now takes today's date; `TodoApp` passes it to each `TodoItem`.
- **Tests:** I added unit tests for today, tomorrow, and tomorrow falling on the first of a month or year. I added a browser test set at 11:30 pm on Oct 31: it checks the labels, then moves the clock past midnight, reloads, and checks that tomorrow's todo now says "Due today".
- **One existing test changed:** the "survives a reload" browser test didn't fix the date, so it would have failed on Nov 2, when its Nov 3 todo reads "Due tomorrow". It now uses a fixed date like the other date tests.

I've marked the task done in the status file; nothing was pushed. The worktree is clean and the steering inbox had no messages.
