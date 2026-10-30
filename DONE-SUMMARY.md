The footer now has a "Move overdue to today" button. It only appears while at least one todo is overdue, and clicking it sets every overdue todo's due date to today. The change is committed on `fm/reschedule-overdue-r3` as `2a12e1f`, which fast-forwards from `main`, and I've reported done to firstmate. Lint, typecheck, the 23 unit tests and all 8 end-to-end tests pass.

- **Behaviour:** completed todos and todos with no date never count as overdue, so they keep their dates. Once the button is clicked, the overdue count drops to 0 and the button disappears.
- **Code:** a new `moveOverdueToToday` helper in `lib/todos.ts` is wired to the button in `components/TodoApp.tsx`, and `app/due-dates.css` positions it so it can be clicked above the footer's shadow overlay.
- **Tests:** two new unit tests, plus one end-to-end test that clicks the button, checks a completed overdue todo keeps its date, and checks the result survives a page reload.
- **Docs:** one line in `README.md` updated to mention the helper.

The worktree is clean, the task inbox had no messages, and nothing was pushed.
