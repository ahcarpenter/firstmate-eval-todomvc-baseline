Multiple named lists are working and committed as `30bea69` on `fm/multiple-lists-r3`. The worktree is clean, the branch fast-forwards from `main`, and I've written `done` to the status file. Lint, typecheck, the unit tests (17) and the Playwright end-to-end tests (3) all pass.

**What it does:**
- **Creating lists:** typing a name into the "New list name" field and pressing Enter creates the list and switches to it. Every list shows as a link, and the current one is highlighted.
- **Separate todos:** each list keeps its own todos. The All/Active/Completed filters, the "items left" counter and "Clear completed" work only within the current list.
- **URLs:** lists live at `/lists/<id>`, `/lists/<id>/active` and `/lists/<id>/completed`. The list ID comes from its name ("Weekend Chores" becomes `weekend-chores`), and a number is added if the name is already taken (`groceries-2`).
- **Home page:** `/` opens the first list. The old `/active` and `/completed` URLs still work and show the first list's filtered view.
- **Existing todos:** todos saved before this change become a list called "Todos" the first time the app loads. The old saved copy is left in place, not deleted. People with no saved todos start with an empty "Todos" list, so `/` always has a list to open.

Typing a list address that doesn't exist shows "This list does not exist." and turns off the new-todo field.

Most of the change is in `components/TodoApp.tsx` and `lib/todos.ts`. The new list pages are in `app/lists/[id]/[[...filter]]/page.tsx`, the end-to-end tests in `e2e/lists.spec.ts`, and the README describes the new layout.

**Existing bug, not fixed:** new todo numbers are worked out from how many todos a list has. After you delete one, the next todo you add can share a number with one that's already there, and ticking one of them can tick both. This was already in the app and is outside this task; it's a one-line fix if you want it.
