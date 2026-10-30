You can now toggle, edit and delete todos from the keyboard, and every control announces what it is. The change is committed as `532d280` on branch `fm/a11y-keyboard-r1`, a fast-forward on top of `main`. Lint, typecheck, the unit tests and all 7 browser tests pass. Nothing was pushed, and the status file now reads `done`.

**What changed:**
- **Delete button:** the stock stylesheet hid it with `display:none`, which also took it out of the Tab order. Now you can Tab to it, it shows on hover or when anything in that todo has focus, and it's announced as "Delete *title*". After a delete, focus moves to the new-todo field so it isn't lost.
- **Editing:** each todo has a new ✎ Edit button ("Edit *title*") next to delete, so you no longer need to double-click; double-click still works too. In the edit field, Enter saves and Escape cancels, and both put focus back on the Edit button. Clicking away still saves, as before.
- **Labels:** each todo's checkbox is named by the todo's title. The new-todo field, the edit field and the Edit/Delete buttons have labels, and the current filter link (All / Active / Completed) is marked as the current page.
- I changed the footer hint to "Double-click or use the edit button to edit a todo".

The new tests in `e2e/keyboard.spec.ts` cover control names, toggling with Space, editing with Enter and Escape, deleting, and the old double-click-then-click-away save.

One bug came up while testing: the Enter that saved an edit moved focus to the Edit button before the keystroke finished, so the same keystroke reopened the editor. It's fixed in `components/TodoItem.tsx`.

My steering inbox was empty, so nothing needed handling there.
