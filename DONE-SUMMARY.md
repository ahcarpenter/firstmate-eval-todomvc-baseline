I added the "Sort by date" checkbox. It's committed on `fm/sort-by-due-r1` as `a44a00e`, which fast-forwards from `main`, and I've reported `done` to firstmate. Lint, typecheck, the 20 unit tests and all 5 end-to-end tests pass.

**How it works:**
- The checkbox sits in the footer, between the filter links and "Clear completed".
- When checked, todos show earliest due date first. Todos with no due date, or a malformed one like `2026-02-31`, go last. Todos due the same day keep their usual order.
- It sorts whatever the current filter shows, so it works in All, Active, Completed and Overdue.
- The choice is saved in the browser under `todos-nextjs-sort-by-due`, so it survives a reload.
- The code changes are in `lib/todos.ts` and `components/TodoApp.tsx`, plus a few lines of CSS.

**Tests and docs:** I added unit tests for the sort order and one end-to-end test. That test covers the order, reloading, and the Active and Completed filters. It doesn't check the Overdue filter, which uses the same code. I also added one line to the README naming the new storage key. A screenshot of the footer is in the task's data folder (`home/data/sort-by-due-r1/footer.png`); the checkbox shows and works there.

**Things to know:**
- **Setup check:** this folder is the repository's only checkout, not a separate worktree split off from another one. The path does match the folder I was launched in, and firstmate runs from its own folder, so I went ahead. Firstmate should confirm that's the intended setup before merging.
- **Footer space:** the footer is now crowded. In the screenshot, "2 items left · 1 overdue" wraps onto three lines.
