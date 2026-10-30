I split `components/TodoApp.tsx` so the list logic can be unit tested on its own, and committed it as `bdb61ca` on `fm/refactor-state-r3`. The branch fast-forwards cleanly onto `main`, and the status file now says `done`.

**Inbox:** I acted on firstmate's message 001 ("use your best judgement… carry on") and moved it to `handled/`. I also added a `resolved` line to close my earlier `blocked`.

**What changed:**
- **`lib/todoReducer.ts`** (new): all the changes to the todo list as one plain function: load, add, toggle, toggle all, delete, save edit (an empty title deletes the todo), and clear completed. It doesn't touch React or the browser.
- **`lib/todoReducer.test.ts`** (new): 9 unit tests for it.
- **`components/useTodos.ts`** (new): loads the list from browser storage after the page loads and saves it on every change, same as before.
- **`components/TodoApp.tsx`**: now only draws the page. It still tracks the new-todo text and which item is being edited.
- **`README.md`**: updated the Layout section, which described the old file split.

**Checks:**
- Lint, typecheck, unit tests (16, all passing) and the existing e2e smoke test pass.
- The smoke test only covers adding a todo, so I also ran a one-off browser check from outside the repo. It passed: adding (with trimming and blank input ignored), toggling, editing, deleting by clearing the title, staying after reload, the All/Active/Completed filters, clear completed, and mark all complete.

**Assumptions:**
- I worked in the checkout I was launched in, which looked like the primary checkout rather than a separate worktree, because firstmate said to carry on.
- I kept `nextId` as it was (number of todos + 1), even though it can produce duplicate IDs after a delete. Fixing it would change behaviour, which the task ruled out, so it could be a follow-up.
- The reducer works from the latest list rather than from the copy the old handlers captured. For one action per event the result is the same.

The worktree is clean. Only git-ignored build output from the e2e run is left, plus my scratch files under `home/data/refactor-state-r3/`.
