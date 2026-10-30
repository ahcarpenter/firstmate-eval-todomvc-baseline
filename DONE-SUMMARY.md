I fixed the bug where checking off or deleting one todo also hit another. The fix is committed on branch `fm/fix-duplicate-ids-r2` as `03b8287`, a clean fast-forward from `main`. Nothing was pushed.

**Cause:** in `lib/todos.ts`, `nextId` gave each new todo the number of todos plus one. After a delete, that number could belong to a todo that still existed. For example, with A, B and C (1, 2, 3), deleting A and adding D gave D the number 3, the same as C. Any check or delete on one of them then affected both, which is why it only started after deleting something.

**Fix (`lib/todos.ts`):**
- `nextId` now uses the highest existing number plus one, so a number is never reused.
- People who already hit the bug have duplicates saved in their browser storage. A new `dedupeIds` step runs when the list loads and gives any repeated todo a new number, so those lists repair themselves.

**Tests:**
- New unit tests in `lib/todos.test.ts` cover `nextId` after a delete and `dedupeIds`.
- A new browser test in `e2e/smoke.spec.ts` repeats the reported steps: add A, B, C, delete A, add D, check C, delete D. It fails with the old `nextId` and passes with the fix.
- Unit tests (10/10), lint, typecheck and both browser tests pass.

The worktree is clean, the status file has the `done` line, and the steering inbox was empty.
