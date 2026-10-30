Each todo now has a "Duplicate" button next to its delete button. It inserts a copy right below the original with the same title, not completed. The change is committed as `dc8fed9` on `fm/fix-duplicate-ids-followup-r2` and fast-forwards cleanly onto `main`. Lint, typecheck, unit tests (13) and e2e tests (3) all pass, and a screenshot shows the button sitting correctly beside the ×.

- **How the copy works:** a new `duplicateTodo` function in `lib/todos.ts` gives the copy a fresh id from `nextId`. So it toggles, edits and deletes on its own, and it's saved in localStorage like any other todo, so it survives reloads.
- **Look:** the button appears on hover, like the delete button. Its styling is in a new file, `app/todo-extras.css`, which also adds right padding to long titles so they don't run under the buttons.
- **Tests:** there are new unit tests for `duplicateTodo` and a new e2e test that covers copy position, completed state, independent toggle/delete, and reload.
- **Existing tests changed:** the button's text broke two existing e2e tests. A selector like `hasText: "A"` also matched "Duplicate", and each item's text now includes the button. Those assertions now check the todo labels instead.

I also updated one line in `README.md` that describes `TodoItem`.

The status file has `working` and then `done: ready in branch fm/fix-duplicate-ids-followup-r2`. Nothing was waiting in the steering inbox, and nothing was pushed.

One thing to check: this directory is a standalone clone, not a linked worktree, and it's the only checkout of todomvc I found. The path checks matched where I was launched, and it was on a detached HEAD as the brief said, so I went ahead. If this is actually the primary checkout, the branch was created there.

The screenshot and the script that produced it are in `home/data/fix-duplicate-ids-followup-r2/`.
