Toggling, editing and deleting todos now all work from the keyboard, and every control has a name a screen reader can announce. It's committed on `fm/a11y-keyboard-r3` (`4b6385d`), which fast-forwards from `main`, and I've reported `done` to the status file. Lint, typecheck, the 7 unit tests and all 5 end-to-end browser tests pass; 4 of those browser tests are new and drive the keyboard flows below.

**Names screen readers now announce:**
- **Todo checkbox:** the todo's title, e.g. "Buy milk".
- **Buttons:** `Edit "Buy milk"` and `Delete "Buy milk"`. The edit field has the same `Edit "…"` name.
- **New-todo input:** "New todo" (it previously had only placeholder text).
- **Filters:** the list is named "Filter todos", and the selected filter is marked as the current page.

**Keyboard behaviour:**
- **Toggle:** Tab to a todo's checkbox and press Space.
- **Edit:** each todo has a new ✎ Edit button. Enter saves and Escape cancels; either way focus goes back to that Edit button. Double-click still works, and the footer hint now mentions the button.
- **Delete:** the Edit and Delete buttons used to be fully hidden until hover, which also removed them from the tab order and from screen readers. They're now hidden with opacity in a new `app/a11y.css`, so they stay reachable and appear on hover or when anything in the row has focus.
- **Focus after a todo disappears:** when the focused todo is deleted or filtered out (e.g. checked off under "Active"), focus moves to the next todo, or to the new-todo input if none is left. After "Clear completed" it goes to the new-todo input.

**Two bugs fixed along the way:**
- **Enter reopened the editor:** focus returned to the Edit button so quickly that the same Enter press triggered it. The edit field now swallows the Enter after saving.
- **Escape could still save:** the blur when the field closed could save the text the user had just cancelled. That blur is now ignored after Enter or Escape.

I also updated the README's file list to mention the Edit and Delete buttons and `a11y.css`. Nothing was pushed, and the worktree is clean.
