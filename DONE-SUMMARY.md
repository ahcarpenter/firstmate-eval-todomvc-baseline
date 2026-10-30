Todos can now have an optional due date. It's committed on `fm/due-dates-r2` as `d5c5a38`, a clean fast-forward from `main`, and I've marked the task done in the status file. Lint, typecheck, the unit tests and both end-to-end tests pass, but I didn't look at the page in a browser, so the layout of the new field hasn't been checked by eye.

- **Adding a date:** a "Due date" field sits next to the "What needs to be done?" input. Pressing Enter in either field adds the todo, and both fields clear afterwards.
- **Showing it:** a todo with a date shows small grey text like "Due Nov 3" under its title. Todos without one show nothing extra. The text is built from the date's own parts, so it won't shift by a day across time zones.
- **Keeping it:** the date is saved with the todo, so it survives a reload. Todos saved before this change still load and simply have no date.
- **Tests:** I added unit tests for the date text, and an end-to-end test that adds one todo with a date and one without, reloads, and checks both.

The changes are in `components/TodoApp.tsx`, `components/TodoItem.tsx` and `lib/todos.ts`, plus a new stylesheet, `app/app.css`.

There's an existing bug I didn't fix because it's outside this task: each new todo's ID is the number of todos plus one (`lib/todos.ts`), so deleting a todo and then adding one can create two todos with the same ID. Those todos would then be toggled, edited and deleted together.

The task's message inbox was empty, so there was nothing to handle there.
