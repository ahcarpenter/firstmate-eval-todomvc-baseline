The footer now has a "Move overdue to today" button. It only shows while at least one todo is overdue, and clicking it sets every overdue todo's due date to today. It's committed as `952f064` on `fm/reschedule-overdue-r1`, on top of current `main`, and I've reported `done` to firstmate. Nothing was pushed and no PR was opened. Lint, typecheck, the unit tests (27 passed) and the end-to-end tests (8 passed) all pass.

- **How it behaves:** completed todos and todos due today or later keep their dates. Once nothing is overdue, the overdue count and the button both disappear, and the change survives a page reload.
- **Layout change you didn't ask for:** with the button showing, "Sort by date" and "Clear completed" were pushed off the right edge of the footer, as a screenshot showed. I let the footer wrap onto a second row, which fixes it. This also applies when the button isn't there: in my screenshots, "Clear completed" moved to a second row too.
- **Tests:** I added unit tests for the new helper in `lib/todos.ts` and an end-to-end test for clicking the button.

The before/after screenshots are in `home/data/reschedule-overdue-r1/`, and the steering inbox had no messages.
