Overdue todos now have a "Snooze" button that moves the due date to tomorrow. It's committed as `f0655a8` on branch `fm/overdue-followup-r1`, which fast-forwards cleanly from `main`. Lint, typecheck, the 18 unit tests and the 4 end-to-end tests all pass.

- **How it works:** the button appears only on overdue todos, just left of the delete "×". Clicking it sets the due date to the day after today, so the todo stops being overdue. The new date is saved with the rest of the list and survives a reload.
- **Date handling:** a new `nextDay` helper in `lib/todos.ts` works out tomorrow, including across month ends, year ends and leap days. It has its own unit tests.
- **New end-to-end test:** it fixes the date at Oct 31, snoozes a todo to Nov 1, and checks that the button and the overdue count disappear and the new date survives a reload.
- **Layout:** overdue rows get extra right padding so long titles wrap before reaching the button. I checked this in a screenshot of the running app, saved outside the repo as `home/data/overdue-followup-r1/snooze.png`.

The README didn't need changes. I've written the `done` line to the status file, the steering inbox is empty, and nothing was pushed.
