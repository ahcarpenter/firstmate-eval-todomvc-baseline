I split up `components/TodoApp.tsx`, and the list logic can now be unit tested on its own. It's committed as `0ab4aea` on `fm/refactor-state-r2`, which fast-forwards from `main`. Nothing is pushed and I opened no PR. The status file has the `done` line.

**What changed:**
- **`lib/todoReducer.ts`** is new. It holds every list change: add, toggle, toggle all, delete, edit, clear completed, and loading saved todos. It doesn't depend on React or the browser, so it can be tested directly.
- **`lib/todoReducer.test.ts`** has 10 new tests for it.
- **`hooks/useTodos.ts`** keeps the list and loads and saves it to the browser's storage, the same way as before.
- **`components/TodoFooter.tsx`** is the item count, filter links and "Clear completed" button, moved out of `TodoApp`.
- **`components/TodoApp.tsx`** now just lays out the page. It still tracks the new-todo text and which todo is being edited, since that's screen state rather than list state.
- **`README.md`**: the layout section described the old structure, so I updated it.

**Checks:**
- Lint, typecheck and all 17 unit tests pass.
- The existing end-to-end test passes.
- The repo's only end-to-end test checks adding a todo, so I wrote a wider browser test outside the repo, in `home/data/refactor-state-r2/`. It covers trimming, blank input being ignored, toggle, toggle all, edit by Enter, Escape and clicking away, a blank edit deleting the todo, delete, the three filters, clear completed, and the exact data saved after a reload. It passes on both `main` and the new branch, so behaviour hasn't changed.

**Existing bug, not fixed:** new todo IDs are "number of todos + 1". After you delete a todo, a new one can get the same ID as one still in the list, and then a toggle or edit would hit both. I left it alone because you asked for no change in behaviour. It's a one-line fix in `nextId` in `lib/todos.ts` if you want it as a follow-up.
