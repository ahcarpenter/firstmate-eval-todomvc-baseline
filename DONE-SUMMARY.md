I fixed the bug where checking off or deleting one todo could affect another. The fix is committed on `fm/fix-duplicate-ids-r1` as `5a3543f`, and the status file now says done.

**Cause:** `nextId` in `lib/todos.ts` set a new todo's ID to the number of todos plus one. After a delete, that number could match an ID still in use, so two todos shared an ID and were checked off or deleted together. That's why it only started after something was deleted.

**Fix:**
- New todos now get the largest existing ID plus one, so IDs are never reused.
- Todos saved in the browser are checked when the app loads, and any duplicate ID gets a new number. Without this, lists that already had the problem would keep misbehaving.

I added unit tests for both. All 10 unit tests pass, and typecheck and lint are clean. I didn't run the browser end-to-end tests or try the fix in the running app.

The branch is one commit ahead of `main`, so it can be merged as a fast-forward, and the worktree is clean. One thing to know: `git worktree list` shows only this checkout, so I couldn't confirm from the repo that it's separate from your main checkout. It is the directory I was launched in, so I went ahead on the branch.
