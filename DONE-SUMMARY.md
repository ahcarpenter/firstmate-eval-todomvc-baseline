The TodoMVC footer now shows how many todos are completed, for example **"123 completed"**. The change is committed as `86085a5` on `fm/completed-count-r3`, a clean fast-forward from `main`. I did not push or open a PR, and I appended the `done` line to the status file.

- **Placement:** I first put the count next to "N items left", but in the browser it ended about 3px from the filter links with only two-digit counts, so larger counts would overlap. It now sits on its own row below the footer controls, and I checked it with 150 todos (27 left, 123 completed).
- **Files:** `components/TodoApp.tsx` adds the count, and a new `app/todo.css`, imported in `app/layout.tsx`, holds the layout styles. The "N items left" text is unchanged.
- **Tests:** a new end-to-end test checks the count when todos are checked off, after a page reload, and after "Clear completed". Lint, typecheck, the 7 unit tests and both end-to-end tests pass.

Separately, I noticed an existing bug I didn't touch: `nextId` in `lib/todos.ts` returns `todos.length + 1`. After a todo is deleted, a new todo can get the same id as one that still exists, which breaks toggling, editing and deleting for both.

The inbox had no messages.
