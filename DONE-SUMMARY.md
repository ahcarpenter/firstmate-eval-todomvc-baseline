Renaming a todo now follows the same rule as adding one. The change is committed on `fm/dedupe-active-followup-r2` (`7235278`), and lint, typecheck, the 12 unit tests and the 5 end-to-end tests all pass.

- **Behaviour:** if you rename a todo to the title of another todo that isn't done, the rename is refused. Matching ignores case and extra spaces, as when adding. The todo keeps its old title, edit mode closes, and the usual "“X” is already on your list." message appears.
- **Allowed cases:** renaming to the title of a completed todo works. So does changing only a todo's own case or spacing, because a todo is never counted as a duplicate of itself.
- **Code:** `findActiveDuplicate` in `lib/todos.ts` takes an optional `ignoreId` for the todo being renamed, and `save` in `components/TodoApp.tsx` checks it before applying the new title.
- **Tests:** one new unit test for the self-match case, and two end-to-end tests: one for a refused rename, one for renaming to a completed todo's title.

The branch is a clean fast-forward onto `main`, the worktree is clean, and I added the `done` line to the status file. Nothing was pushed, and the steering inbox had no messages.
