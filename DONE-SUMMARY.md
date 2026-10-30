Optional due dates are in. They're committed on branch `fm/due-dates-r3` as `f5ffddb`, which sits directly on top of `main`, and the status file now says done. Lint, typecheck, unit tests and the end-to-end tests all pass, and I checked the result in a screenshot.

- **Adding a todo:** a field labelled "Due date" sits on the same row as "What needs to be done?". Pressing Enter in either field adds the todo, and the date field clears after each add.
- **Showing it:** a todo with a date shows a small grey "Due Nov 3" after its title. Todos without a date show nothing extra.
- **Saving it:** the date is saved with the todo in the browser's storage, so it's still there after a reload. Todos saved before this change still load fine.
- **Time zones:** the date is stored as plain year-month-day and turned into text without converting it to a time, so "Nov 3" can't slip to Nov 2 in a different time zone.
- **Layout:** my first version put the date field on its own row, but the "mark all complete" arrow then sat beside the date field instead of the todo input. Putting both on one row fixed it.

The changes are mostly in `lib/todos.ts`, `components/TodoApp.tsx`, `components/TodoItem.tsx`, a new `app/due-dates.css`, plus new tests. I also updated one line of `README.md`. Test output and the screenshot are in `home/data/due-dates-r3/`, outside the project folder.

One existing bug I noticed but didn't touch: new todos are numbered by counting the current list, so deleting one and then adding another can give two todos the same number. Since edits, toggles and deletes find a todo by that number, they could then hit the wrong one. It's a separate fix.
