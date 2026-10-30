Todos due soon now show friendlier dates: "Due today" for today, "Due tomorrow" for tomorrow, and the usual "Due Nov 3" form for every other date. "Today" is the person's own local date. The change is committed on `fm/due-soon-r2` as `c0b67df`, and the branch fast-forwards cleanly onto `main`. Lint, typecheck, the unit tests (20) and the end-to-end tests (6) all pass, and I've reported done to firstmate.

- **Date logic:** in `lib/todos.ts`, `formatDue` now takes today's date as an optional second argument. A new helper, `tomorrowKey`, works out the next calendar day and handles month ends, year ends and leap days.
- **Wiring:** `TodoApp` passes `today` down to each `TodoItem`, which uses it when showing the due date.
- **Tests:** I added unit tests for both functions, plus an end-to-end test with the clock set to 11:30 pm local time. That's when the UTC date has often already moved on, so it checks that "today" follows the person's calendar.
- **Existing test fix:** the earlier due-date end-to-end test checked for "Due Nov 3" without a fixed clock. Run on Nov 2 it would now see "Due tomorrow", so I fixed its clock at Oct 30, 2026.

The steering inbox had no messages. Nothing was pushed and no PR was opened.
