I split up `components/TodoApp.tsx` and committed it as `5071200` on `fm/refactor-state-r1`. The branch is a clean fast-forward from `main`, I posted the `done` status line, and the worktree is clean.

**How it's split now:**
- **`lib/todoState.ts`**: the list logic (add, toggle, toggle all, delete, edit, clear completed) as plain functions with no React or browser code, plus an active-item count. It has its own unit tests in `lib/todoState.test.ts`.
- **`lib/useTodos.ts`**: connects that logic to React and handles loading from and saving to `localStorage`, the same way as before.
- **`components/TodoApp.tsx`**: now only draws the page and keeps what's typed in the new-todo box and which todo is being edited.
- **`README.md`**: I updated the layout section, since it still said `TodoApp.tsx` holds the state.

**Checks:** lint, typecheck, unit tests (17 pass) and the existing end-to-end test all pass. That end-to-end test only covers adding a todo, so I wrote a longer browser test outside the repo, in the task data folder. It covers blank input, filters, editing (Enter, Escape, clicking away, clearing the title), toggle all, clear completed, deleting, and data surviving a reload. It passes on both `main` and the new branch, so the app behaves the same.

**Existing bug, left as is:** a new todo's ID is the number of todos plus one, so deleting one can lead to two todos with the same ID. For example, delete todo 1 from [1, 2], add a new one, and it also gets ID 2. I kept this because the app had to behave exactly as before. It's worth fixing as its own change.
