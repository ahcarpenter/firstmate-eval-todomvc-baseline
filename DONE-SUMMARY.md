I added the search field, committed it to `fm/search-r1` (commit `39cd250`) and reported it done to firstmate.

**What it does:** a field labelled "Search" now sits between the new-todo input and the list. It only shows when there are todos. Typing shows only the todos whose title contains the text, ignoring letter case, inside whichever filter you're on (All, Active, Completed or Overdue). Clearing the field shows them all again. The "items left" counter still counts every active todo. Lint, typecheck, unit tests (25) and end-to-end tests (7) all pass, including new tests for the search. I also took a screenshot to check the layout, saved outside the repo.

**Decision for you:** the search text clears when you switch filters, because each filter is a separate page that reloads the app. The brief didn't say whether search should carry over. If you want it to, I'd store it in the URL (e.g. `?q=`) as a small follow-up.

**Small choice:** spaces at the start and end of the search are ignored, so a search of just spaces shows every todo.

The branch is a clean fast-forward onto `main`, and the worktree is clean. I didn't push or open a PR.
