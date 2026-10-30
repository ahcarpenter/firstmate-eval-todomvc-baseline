Pinning is done and committed on `fm/refactor-state-followup-r2` (commit `9bbcb01`). The branch is a clean fast-forward from `main`, the worktree is clean, and I added the `done` line to the status file. Lint, typecheck, the 21 unit tests and both Playwright end-to-end tests all pass.

**What it does:**
- Every todo has a "Pin" button, which reads "Unpin" once the todo is pinned.
- Pinned todos show above the rest, and both groups keep their usual order.
- Pins are saved with the todo in localStorage, so they survive a reload.
- The All, Active and Completed filters still apply. Sorting happens after filtering, so pinned todos also come first within Active and Completed.

**Two changes beyond the request:**
- **Fixed duplicate todo ids.** New todos got their id from the list length, so deleting one and adding another could give two todos the same id. Pinning one of those would have pinned both. Ids are now the highest existing id plus one.
- **Updated the existing smoke test.** It checked the whole row's text, which now includes "Pin", so it failed. It now checks only the todo's title.

**Tests added:** unit tests for pinning, the pinned-first ordering and the id fix, plus a new end-to-end test (`e2e/pin.spec.ts`) that covers pinning, reload, all three filters and unpinning.

I also took a screenshot to check that the button sits next to the delete "×" without covering long titles; it's saved outside the repo at `home/data/refactor-state-followup-r2/pin.png`. The task inbox had no messages. Nothing was pushed, as the brief requires.
