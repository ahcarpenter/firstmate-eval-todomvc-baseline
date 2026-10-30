The app now shows how many todos you've completed. It's committed as `5c03dc6` on `fm/completed-count-r1`, a clean fast-forward from `main`, and I've reported it done. Nothing was pushed.

- **What it looks like:** a new "N completed" line at the bottom of the footer, under "items left", the filters and "Clear completed". It's always shown, including "0 completed". It updates when you tick a todo, survives a page reload, and goes back to 0 after "Clear completed".
- **Why a separate line:** I first put it on the same row, but it pushed the filter links down out of place. Even when it fits, a two-digit count would crowd them. A small new stylesheet, `app/globals.css`, gives it its own row. I checked screenshots at full width and at 390px (phone width), and nothing overlaps.
- **Tests:** I added an end-to-end test for the count. Lint, type checks, 7 unit tests and 2 end-to-end tests all pass.

**Unrelated bug:** `nextId` in `lib/todos.ts` gives a new todo the ID "number of todos + 1". After you delete a todo, a new one can get the same ID as an existing one, so ticking or deleting one could affect the other. I didn't fix it because it's outside this task.

Screenshots are in `home/data/completed-count-r1/`.
