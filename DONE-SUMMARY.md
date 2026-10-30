Overdue todos are done and committed on `fm/overdue-r1` (commit `b19c2d9`), one fast-forward commit on top of `main`. Nothing was pushed, the worktree is clean, and I've written the `done` status line.

- **What counts as overdue:** a todo that isn't completed and has a valid due date before today, using the browser's local date. A todo due today is not overdue. The logic is in `isOverdue` and `localDay` in `lib/todos.ts`.
- **On each todo:** a red "Overdue" label appears next to the due date.
- **Filter:** an "Overdue" link at `/overdue` sits beside All, Active and Completed.
- **Footer:** shows a count like "2 overdue" next to "N items left". When nothing is overdue, the count is hidden rather than showing "0 overdue".
- **Footer layout:** the extra count overlapped the "All" link, so the footer is now laid out as a single row. My first version of that fix left the filter links unclickable; the new e2e test caught it and the fix is in the commit.
- **Tests:** lint, typecheck and 16 unit tests pass, and the 3 e2e tests passed 3 runs each. I added unit tests for overdue, the filter and the local date, plus one e2e test covering the marker, the count, `/overdue`, and completing a todo.
- **Existing test changed:** the earlier due-date e2e test now pins the browser clock to 2026-10-29. Without that it would start failing after Nov 3, when its fixture date becomes overdue.
- **README:** updated to list `/overdue` among the routes.

A screenshot of the `/overdue` page is in `home/data/overdue-r1/overdue.png`.

`git worktree list` shows only this one checkout, not a separate pool worktree. It is the directory I was launched in, so the isolation check passed, but you may want to confirm that's what you intended.
