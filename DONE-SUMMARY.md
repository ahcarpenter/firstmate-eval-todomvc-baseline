Todos can now take an optional due date. It's committed on `fm/due-dates-r1` as `5f1ccaf`, which sits directly on top of `main`. I've marked the task done in the status file. Nothing was pushed.

- **Adding:** there's a "Due date" date field to the right of "What needs to be done?". Pressing Enter in either field adds the todo, and the date field clears afterwards.
- **Showing:** a todo with a date shows "Due Nov 3" next to its title in a smaller grey font. Todos without a date show nothing extra. Editing a todo's title keeps its date.
- **Saving:** the date is stored with the todo, so it's still there after a reload. Todos saved before this change still load.
- **Main files:** `lib/todos.ts` (new `formatDue`), `components/TodoApp.tsx`, `components/TodoItem.tsx`, plus a small stylesheet `app/due-dates.css`.

Lint, typecheck, the unit tests (10) and the browser tests (2) all pass. I added unit tests for date formatting, including impossible dates like Feb 31 being ignored. The new browser test adds a dated todo and an undated one, reloads, and checks both. I also looked at a screenshot of the page and the layout is right; it's saved outside the repo at `home/data/due-dates-r1/shot.png`.

One existing bug I didn't touch because it's outside this task: new todo IDs are "number of todos + 1". After you delete a todo that isn't the last one, the next todo you add can get the same ID as one already in the list, which can make clicks act on the wrong item.
