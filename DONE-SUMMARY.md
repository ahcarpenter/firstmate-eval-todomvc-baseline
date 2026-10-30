The footer now has a "Move overdue to today" button, shown only while at least one todo is overdue. Clicking it sets every overdue todo's due date to today. It's committed as `64a8848` on `fm/reschedule-overdue-r2`, which fast-forwards from `main`. Typecheck, lint, the 23 unit tests and all 8 end-to-end tests pass. I've written the `done` line to the status file.

- **How it works:** a new `moveOverdueToToday` in `lib/todos.ts` uses the existing `isOverdue` check. That means completed todos, todos without a date, todos due today or later, and todos with a malformed date are left alone.
- **Placement:** the button sits on its own centred row in the footer, between the filters and the "Sort by date" checkbox. It's red, like the "overdue" count. I checked screenshots at 800px and 400px wide and both look right. They're saved with the task's scratch files under `home/data/reschedule-overdue-r2/`.
- **Tests:** I added one unit test for the new function. I also added one end-to-end test: overdue todos change to "Due today", the overdue labels, count and button disappear, and this still holds after a reload.

At 800px, the "1 overdue" count already crowds the "All" filter link; that was there before this change and I didn't touch it. No steering messages arrived during the task, and the worktree is clean.
