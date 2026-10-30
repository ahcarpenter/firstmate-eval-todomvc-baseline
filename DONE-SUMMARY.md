If you type a todo that's already on your list and not done yet, the app now leaves the list alone and tells you it's already there. Lint, typecheck, unit tests (11) and the browser tests (2) all passed. The change is committed on `fm/dedupe-active-r1` (e4ec9af), and the branch fast-forwards onto `main`. I didn't push it, and the status file says `done`.

How it behaves:
- **What counts as a duplicate:** the same title, ignoring capital letters and extra spaces, so "  buy   MILK " matches "Buy milk". A todo you've already marked done doesn't block adding it again.
- **What you see:** a short line under the input, e.g. `"Buy milk" is already on your list.` The text you typed stays in the box so you can change it. The message goes away when you type again or when you add a todo.

The matching logic is a new `findActiveDuplicate` function in `lib/todos.ts`, with unit tests. The browser-test file `e2e/smoke.spec.ts` gets a test that tries the duplicate, marks the original done, then re-adds it. The message is styled inline in `components/TodoApp.tsx` because the app has no stylesheet of its own. I didn't look at the page in a browser myself; the automated browser test is the only check of how it appears.

Two things I left out of scope:
- Renaming an existing todo to match another one isn't blocked; the request only covered adding.
- There's an existing bug where a new todo can get the same ID as an existing one after you delete something. Fixing it would mean changing how IDs are generated in `lib/todos.ts`.
