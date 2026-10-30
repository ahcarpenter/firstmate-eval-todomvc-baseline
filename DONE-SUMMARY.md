The overdue feature is committed on `fm/overdue-r3` as `8b507ee`, one commit fast-forward on top of `main`. Nothing was pushed. I've appended `done` to the status file, and the steering inbox had no messages.

**What it does:**
- **Rule:** a todo is overdue when it isn't completed and its due date is before today. "Today" is the viewer's local date, and a todo due today is not overdue. The rule and its date helper are in `lib/todos.ts`.
- **Label:** overdue todos show a red "Overdue" label after their due date.
- **Filter:** an Overdue link sits after Completed and opens `/overdue`, which lists only overdue todos and survives a reload.
- **Count:** the footer shows "N overdue" next to "N items left". It always shows, including "0 overdue". The intent didn't say whether to hide it at zero, so that is easy to change.

**Footer layout:** adding a fourth filter made the stock TodoMVC footer overlap the counts, which I saw in screenshots. I switched the footer to a flex row and let the filter list wrap on narrow screens. The first version of that fix made the filter links unclickable, because the footer's shadow layer sat on top of them; the new end-to-end test caught it and I fixed it in the CSS. I checked the final layout in screenshots at 1280px and 400px wide. Those screenshots are in `home/data/overdue-r3/`, outside the repo.

**Checks:** lint, typecheck, 14 unit tests and 3 end-to-end tests all pass. The new end-to-end test pins the date to 2026-10-29. It covers the labels, the count updating when a todo is completed, the `/overdue` route and a reload. The README now lists the new route.

**Worktree caveat:** this checkout is the only worktree of its repository, so I couldn't prove it is a disposable pool slot. Its path does match where I was launched, so I went ahead.
