Every overdue todo now has a "Snooze" button that moves its due date to tomorrow. The change is committed as `3007b5e` on `fm/overdue-followup-r2`, and the status file now reports done.

- **How it works:** a new `tomorrowKey()` helper in `lib/todos.ts` works out tomorrow's local date, including across month and year ends. Clicking the button sets the todo's due date to that day. The todo then stops being overdue, so it drops out of the Overdue filter and the overdue count goes down. The new date is saved and survives a reload.
- **Tests:** I added unit tests for `tomorrowKey()` and an end-to-end test for snoozing. Lint, typecheck, the unit tests (15) and the end-to-end tests (4) all pass. I didn't look at the button's styling in a browser; it's a small underlined text link placed under the "Overdue" label.
- **Other:** I added "snooze" to the description of `lib/todos.ts` in `README.md`.

The branch fast-forwards cleanly from `main`. Nothing was pushed and the worktree is clean. The steering inbox was empty, so there were no messages to acknowledge.

This checkout is the only worktree of its repository. I took it to be the disposable eval worktree I was launched in, not the primary checkout.
