Each todo now has an "Important" star button. It's committed as `69a0ba0` on branch `fm/a11y-keyboard-followup-r1` and reported `done` to firstmate. Nothing was pushed and no PR was opened.

**What changed**
- **Behaviour:** a star button named "Important" sits next to the edit and delete buttons on each todo. Enter or Space toggles it. Screen readers announce whether it's on through `aria-pressed`, the standard attribute for a toggle button.
- **Looks:** a todo marked important always shows a filled gold ★. On other todos, an empty ☆ appears on hover or focus, the same way the edit and delete buttons do.
- **Saved across reloads:** the mark is stored with the todo in the browser's storage (`localStorage`). Todos saved before this change load as not important.
- **Tests:** new unit tests check that saved marks load correctly, including old saved todos without a mark. A new end-to-end test marks a todo from the keyboard, reloads, and checks the mark is still there, then unmarks it and checks again. The existing edit test now tabs from the star, since the star comes before the edit button in tab order.

Lint, type checking, all 9 unit tests and all 8 end-to-end tests pass. The test log is saved in `home/data/a11y-keyboard-followup-r1/e2e.log`.

**Decision for you:** I named the button exactly "Important", as the request said. The other buttons on a todo include its title ("Edit Buy milk", "Delete Buy milk"), so in a long list a screen-reader user hears many buttons that are all called "Important". Naming it "Important: Buy milk" would match the other controls, but it would break the exact name the spec asked for. Changing it is a one-line edit.

The working copy wasn't a separate git worktree but the folder I was launched in, so I went ahead there.
