The progress bar is in, committed as `ea1afde` on `fm/completed-count-followup-r3`, and I've appended the `done:` line to the status file. Typecheck, lint, the unit tests (9/9) and the Playwright tests (3/3) all pass. The branch fast-forwards onto `main`, nothing was pushed, and the checkout is clean.

**Inbox:** message `001.msg` said to use my best judgement, note assumptions and carry on. I moved it to `handled/` and added a `resolved` line closing my earlier block.

**What changed:**
- **Bar** (`components/TodoApp.tsx`): it sits between the header and the list, fills to the share of completed todos, and is labelled e.g. "40% complete". It only shows when the list has todos, like the existing list and footer, and screen readers get it as a progress bar with the current percentage.
- **Percentage** (`lib/todos.ts`): a new `percentComplete` helper rounds to a whole number and returns 0 for an empty list.
- **Styling:** added to `app/todo.css`.
- **Tests:** unit tests for the helper. A new browser test covers the bar being hidden when empty, 0%, 2 of 5 done showing "40% complete", 100% after toggle-all, and the bar disappearing after "Clear completed".

**Assumptions:**
- **Checkout:** I worked on the branch in the repo's only checkout, which is also where `main` lives. The brief's isolation check flagged it, but your reply said to carry on, and branch-only commits are easy to undo.
- **Rounding:** percentages round to whole numbers, so 1 of 3 shows "33% complete".
- **Filters:** the bar counts all todos, not just the ones the current filter shows.
- **Placement:** "under the header" means directly below the new-todo input, above the list.
- **Bar element:** I built it as a styled element rather than the browser's built-in progress bar so it can match the TodoMVC look.
