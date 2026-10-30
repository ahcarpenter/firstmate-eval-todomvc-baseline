Snooze is committed on `fm/overdue-followup-r3` as `13cdf45`, a clean fast-forward from `main`, and the `done` status line is appended. Nothing was pushed or merged, the worktree is clean, and the steering inbox was empty.

- **Behaviour:** each overdue todo now has a Snooze button that sets its due date to tomorrow. The todo then drops out of the Overdue filter and count, and the change survives a reload. Completed and non-overdue todos get no button.
- **Choice of "tomorrow":** the date comes from the clock at click time, not from the last render, so a page left open overnight still gets the right day.
- **Layout:** the button sits between the todo text and the delete button, and the text stays clear of it.
- **Verification:**
  - Lint and typecheck are clean.
  - 17 unit tests pass, including month, year and leap-year rollover.
  - 4 e2e tests pass, including a new snooze test.
  - I checked the layout with `chrome-devtools-axi` at 800px and 400px wide, using a long title. Screenshots are in the task's `data/overdue-followup-r3/` directory.
- **Existing test changed:** the existing overdue e2e test now expects `…OverdueSnooze`, because the button's text is part of the list item.

**Existing bug, not fixed:** `nextId` returns `todos.length + 1`, so adding a todo after deleting an earlier one can reuse an id. Two todos with the same id would both change on a snooze, as they already do on toggle or delete. It needs its own fix.
