Pinning works and is committed as `c0f1554` on `fm/refactor-state-followup-r1`. The branch is a fast-forward of `main`, the worktree is clean, and I've written the `done` line to the status file. Nothing was pushed and no PR was opened.

**What it does:**
- Each todo has a "Pin" button, which reads "Unpin" when the todo is pinned.
- Pinned todos show at the top. Within the pinned and unpinned groups, todos keep their usual order.
- The underlying list is reordered only for display, so an unpinned todo goes back to where it was.
- Pins are saved with the todos in localStorage, so they survive a reload. Todos saved before this change still load and simply start unpinned.
- The All, Active and Completed filters work as before.

**Checks:** lint, typecheck, the 20 unit tests and both end-to-end tests pass. The new end-to-end test pins two todos, reloads the page, runs through all three filters, then unpins one. I also took a screenshot to check the button sits cleanly next to the delete "×", including on a long title that wraps. It's saved under `home/data/refactor-state-followup-r1/pin.png`.

**One existing test changed:** the original smoke test checked the whole row's text, which now includes "Pin". I pointed it at the todo's title instead.

**Files touched:**
- `lib/todos.ts` and `lib/todoState.ts`: the pin field, the ordering and the pin/unpin action
- `components/TodoItem.tsx` and `components/TodoApp.tsx`: the button and the display order
- `app/pin.css` (new) and `app/layout.tsx`: the button styling
- the unit tests, the end-to-end test file and the README

**Separate issue, not fixed:** new todos get their ID from the list length plus one. After a delete, a new todo can get the same ID as an existing one, and pin, toggle, edit or delete would then hit both. This was already there before this change and is out of scope here, but it's worth a follow-up.
