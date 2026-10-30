Each todo now has an "Important" star toggle that works from the keyboard and tells screen readers whether the todo is important. Important todos show a star, and the marks are kept across reloads. All checks pass: lint, typecheck, 9 unit tests and 6 end-to-end tests. It's committed as `87e607d` on `fm/a11y-keyboard-followup-r3`, a clean fast-forward from `main`, and I've reported `done` in the status file.

- **The toggle:** it's a button named "Important" that reports pressed or not pressed. Each one also reads out its todo's title as a description, so the identically named stars can be told apart. It sits between the checkbox and Edit in the tab order, and Enter or Space toggles it.
- **Looks:** like the other row buttons, an outline star appears on hover or keyboard focus. Important todos keep a gold filled star visible all the time.
- **Saving:** the mark is saved in `localStorage` with the rest of the todo. Todos saved before this change load as not important.
- **Tests:** the existing keyboard test needed one extra Tab to get past the star to Edit. I added unit tests for loading saved todos and an end-to-end test that covers keyboard toggling, star visibility and reload.
- **Not checked:** nobody has looked at the layout in a real browser. The tests confirm the star shows and hides as expected, but not whether it overlaps a long title.

Files changed: `components/TodoItem.tsx`, `components/TodoApp.tsx`, `lib/todos.ts`, `app/a11y.css`, `lib/todos.test.ts`, `e2e/smoke.spec.ts` and a one-line `README.md` update. The task inbox was empty, so there were no steering messages to handle.
