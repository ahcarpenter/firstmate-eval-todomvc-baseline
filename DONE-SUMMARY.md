Editing a todo now follows the same rule as adding one. If you rename a todo to the title of another todo that isn't done, the rename is refused with the same `"<title>" is already on your list.` message, and the todo keeps its old title. Renaming to the title of a completed todo still works.

It's committed as `0cb2630` on `fm/dedupe-active-followup-r1`, and the branch fast-forwards cleanly onto `main`. Nothing was pushed and the worktree is clean. Lint, typecheck, the 12 unit tests and the 3 end-to-end tests all pass, including a new end-to-end test that covers both the refused rename and the allowed one.

- **Changes:** the duplicate check in `lib/todos.ts` now takes an optional `exceptId`, so a todo doesn't count as a duplicate of itself. Changing just the capitalisation of a todo's own title is therefore still allowed. The edit-save logic is in `components/TodoApp.tsx`.
- **Two behaviours I picked:**
  - A refused rename closes the edit field instead of leaving it open with the typed text.
  - A successful rename also clears the message.

I've appended the `done:` line to the status file. The steering inbox was empty, so there were no messages to acknowledge.
