The "Sort by date" checkbox is done and committed as `7b2fbad` on `fm/sort-by-due-r2`. It sits directly on top of `main`, so the merge will be a fast-forward. I didn't push or open a PR, and I've reported `done` to firstmate.

**How it works**
- **Checkbox:** it's on its own row under the filter links in the footer.
- **Sort order:** when checked, todos show earliest due date first and undated todos last. Todos with the same date keep their usual order. A todo whose saved date isn't a valid date is placed with the undated ones, the same way the overdue check already ignores bad dates.
- **Filters:** sorting happens after filtering, so it applies within All, Active, Completed and Overdue.
- **Reloads:** the choice is saved in `localStorage` under its own key, `todos-nextjs-sort-by-due`, separate from the todos.

**Layout:** the footer's stacked-paper effect covered the new row at first, so the checkbox couldn't be clicked. I fixed that. On screens 430px wide or less, the filter links move down to the bottom of the footer, so I added a rule to keep them from overlapping the checkbox. I took screenshots of both the desktop and mobile layouts and both look right.

**Changes:** most of the logic is a new `sortByDue` function in `lib/todos.ts`, and the checkbox is in `components/TodoApp.tsx`. The rest is styling in `app/app.css` and two lines in `README.md` about the sorting and the new storage key.

**Checks:** lint, typecheck, 18 unit tests and all 5 end-to-end tests pass. That includes new unit tests for the sort order and an end-to-end test that checks the toggle, reloads, and the Active filter.

The working directory is clean and the steering inbox was empty. One thing worth knowing: `git worktree list` showed this directory as the repository's only checkout, not a linked worktree. It is the directory I was launched in and it matched the brief's starting state, so I went ahead.
