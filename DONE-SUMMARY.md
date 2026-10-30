The progress bar is in and committed on `fm/completed-count-followup-r2` (`975e0eb`), and I've reported `done` to firstmate. Lint, typecheck, the 9 unit tests and the 3 end-to-end tests all pass.

- **What it does:** right under the header there's now a bar showing the share of todos completed, labelled like "40% complete". It's hidden when the list is empty. The percentage is rounded to a whole number, so 1 of 3 shows "33% complete".
- **Where:** the calculation is a new `percentComplete` helper in `lib/todos.ts`, and the bar is in `components/TodoApp.tsx`. I styled it inline because the app has no stylesheet of its own; the colours roughly match the stock TodoMVC CSS. Screen readers announce it as a progress bar with the current value.
- **Tests:** two unit tests for the helper, and one end-to-end test. It checks the bar is absent on an empty list, then shows 0%, 40% and 100% as todos are completed, and disappears again after "Clear completed" empties the list.

**Isolation check:** this directory is the repo's only checkout, not a separate linked worktree. Both path checks matched the directory I was launched in and HEAD was detached, so I went ahead. Firstmate should confirm this isn't its primary checkout.

Nothing was pushed. The branch fast-forwards cleanly onto `main`, the working tree is clean, the task inbox was empty, and test output is saved under `home/data/completed-count-followup-r2/`.
