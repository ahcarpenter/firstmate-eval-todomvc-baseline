If you try to add a todo that's already on the list and not done, the app now leaves the list unchanged and shows a notice: "“Buy milk” is already on your list." The change is committed as `a998df0` on branch `fm/dedupe-active-r3`. Lint, typecheck, unit tests (11) and end-to-end tests (2) all pass.

- **What counts as a match:** capitals and extra spaces are ignored, so "  buy   MILK " matches "Buy milk".
- **Done todos don't block:** if the matching todo is already completed, the new one is added as normal.
- **Input and notice:** what you typed stays in the box so you can change it, and the notice goes away as soon as you type again.
- **Editing isn't covered:** renaming an existing todo to the same title as another one is still allowed. The request was only about adding.

The check is in `findActiveDuplicate` in `lib/todos.ts`, and the notice is in `components/TodoApp.tsx`. I added unit tests and an end-to-end test for the new behaviour. The branch fast-forwards onto `main`, the worktree is clean, nothing was pushed, and the `done` status line is written.

I found an existing bug I didn't fix because it's outside this task: `nextId` numbers a new todo by counting the list, so after a deletion it can reuse an ID that's still taken. For example, add two todos, delete the first, add another, and two todos now have ID 2. That could make toggling, editing or deleting act on the wrong todo.
