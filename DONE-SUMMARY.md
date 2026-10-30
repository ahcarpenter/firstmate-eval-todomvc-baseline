I added pinning to todos and committed it as `20531d8` on `fm/refactor-state-followup-r3`, and reported `done` in the status file. Lint, typecheck, unit tests (20) and Playwright e2e tests (2) all pass. I also checked it in a real browser with a screenshot. Nothing was pushed, and the worktree is clean.

**How it works:**
- Each todo has a "Pin" button that reads "Unpin" when the todo is pinned (`components/TodoItem.tsx`, styled in a new `app/globals.css`).
- Pinned todos show above the others, and each group keeps its normal order (`pinnedFirst` in `lib/todos.ts`). The All, Active and Completed filters still apply to the reordered list.
- Pins are saved with each todo in localStorage, so they survive a reload. Lists saved before this change still load, because the pinned field is optional.

**Other changes in the same commit:**
- **Duplicate id bug (pre-existing):** new todo ids were based on how many todos there were, so after a deletion a new todo could get the same id as an existing one. Pinning one of them would then pin both. Ids now start from the highest existing id.
- **Smoke test:** the existing test checked each list item's full text, which now includes "Pin", so it now checks the todo title only.
- **Tests and docs:** I added unit tests for pinning, ordering and unique ids, an e2e test covering pin → reload → filters → unpin, and a one-line README update.

The screenshot is in the task data folder, at `home/data/refactor-state-followup-r3/pinned.png`.
