I added the Duplicate button and committed it as `07f7ba8` on `fm/fix-duplicate-ids-followup-r3`. The branch fast-forwards cleanly onto `main`, and the status file now says done.

**What it does:** when you hover over a todo, a duplicate button (⧉) appears just left of the delete ×. Clicking it adds a copy right below the original, with the same title and not completed. The copy gets its own fresh id from the existing `nextId`, so you can toggle, edit or delete it without affecting the original. It's saved to localStorage like any other todo, so it survives a reload.

**Changes:**
- `lib/todos.ts`: a new `duplicateTodo(todos, id)` function. If the id doesn't exist, the list comes back unchanged.
- `components/TodoApp.tsx` and `components/TodoItem.tsx`: the button and its click handler. The button is labeled "Duplicate" for screen readers and shows "Duplicate" as a tooltip.
- `app/globals.css` (new, imported in `app/layout.tsx`): styles the button to match the delete button. It also adds right padding so long titles wrap before reaching the two buttons.
- `README.md`: the layout section now mentions these files.

**Tests:** lint, typecheck, 12 unit tests (2 new for `duplicateTodo`) and 3 Playwright tests all pass. The new Playwright test checks:
- the copy appears right below the original and isn't completed, even when the original is;
- the copy is still there after a reload;
- toggling or deleting the copy leaves the original alone.

I also took a hover screenshot with a long title to check the button placement. It's in the task data folder, along with a small server log, both outside the worktree. The inbox was empty, and nothing was pushed.
