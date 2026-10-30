I added the progress bar and committed it on branch `fm/completed-count-followup-r1` (commit `cc0d35a`). It applies cleanly on top of `main`, and I've reported `done` to firstmate. Nothing was pushed.

**What it does:**
- A bar now sits between the "What needs to be done?" field and the list. It fills to the share of todos completed and is labelled like "40% complete".
- It's hidden when the list is empty.
- The percentage is rounded to a whole number.
- I moved the "mark all complete" arrow up so it stays next to the input field instead of sitting on top of the new bar.
- The bar works with screen readers: it's marked as a progress bar named "Todos completed" and announces its value.

**Checks:** lint, typecheck, the unit tests (9) and the end-to-end tests (3) all pass. That includes a new unit test for the percentage and a new end-to-end test for the bar. The new end-to-end test failed at first: clicking a todo's delete button, which only appears on hover, was flaky, so the test now hovers the row before clicking. I also checked it in a real browser with 5 todos and 2 completed: the label read "40% complete" and the fill measured 220px of the 550px bar.

The code changes are in `components/TodoApp.tsx`, `lib/todos.ts` (new `percentComplete` helper) and `app/globals.css`, plus their tests. The screenshot is in the task's data folder at `home/data/completed-count-followup-r1/progress-40.png`.
