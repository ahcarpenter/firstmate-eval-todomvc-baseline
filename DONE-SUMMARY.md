I added the "Search" field. It's committed on the local branch `fm/search-r3` as `39b8412`, which is a clean fast-forward onto `main`. I didn't push or open a PR, and I've reported `done` to firstmate. Lint, typecheck, the 21 unit tests and the 7 end-to-end tests all pass, and a screenshot confirmed the layout.

- **Where it is:** a "Search" box sits between the new-todo row and the list. It only shows when there are todos, like the list itself.
- **How it filters:** it keeps todos whose title contains the typed text, ignoring letter case, within the current All/Active/Completed/Overdue view. The search runs on the filtered list, so date sorting still works on the results. Clearing the box shows everything again.
- **Counter:** "N items left" still counts every active todo, whatever the search hides.
- **Files changed:**
  - `lib/todos.ts`: new `searchTodos` helper.
  - `components/TodoApp.tsx`: the field.
  - `app/due-dates.css`: styling to match the due-date fields.
  - `lib/todos.test.ts` and `e2e/smoke.spec.ts`: unit tests and one end-to-end test.
  - `README.md`: a one-line update.

**Decision for you:** the search box empties when you switch between filter links, because the page reloads its state. The spec didn't say whether the text should carry over, so I left it this way and wrote the test to type the text again after switching. If you want it to carry over, it could be kept in the URL or in storage.

The screenshot is at `home/data/search-r3/search.png`. The firstmate inbox for this task was empty.
