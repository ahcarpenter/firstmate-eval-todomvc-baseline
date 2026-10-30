Lists can now be renamed and deleted. The work is committed as `3381263` on `fm/multiple-lists-followup-r2`, which is a clean fast-forward from `main`, and I've reported `done` in the status file. Lint, typecheck, the unit tests (18) and the browser tests (10, including 4 new ones) all pass.

**How it behaves:**
- **Buttons:** each list's link now has "Rename <name>" and "Delete <name>" buttons beside it. A new component, `components/ListLink.tsx`, draws them.
- **Rename:** the button opens a focused field holding the list's name. Enter saves the new name and Escape cancels. If the field is left blank, the name stays as it was.
- **Delete:** the button asks for confirmation in the browser's confirm dialog, then removes the list and its todos. If that list was open, the app switches to the first remaining list. When only one list is left, its Delete button is greyed out.
- **Saving:** renames and deletions are stored right away, so they survive a reload.

The README's layout section now lists the new component. I checked screenshots of the list bar and the rename field, and they look right. The screenshots and other output are in `home/data/multiple-lists-followup-r2/`.

**Choices to confirm:**
- **Clicking away from the rename field cancels the rename.** Editing a todo works the other way and saves when you click away. The brief only covered Enter and Escape, so I chose the safer option.
- **A deleted list's number can be reused.** If you delete the newest list and then create one, the new list gets the old one's number and URL. So an old link to the deleted list now opens the new one. I didn't change how lists are numbered.

**Setup check:** the brief expected a separate copy of the repo, but this directory is the repo's only checkout and also holds `main`. There was no other checkout to mix it up with, so I went ahead, and I only added the branch and its one commit. Firstmate may want to check that this setup is what it intended. The instruction inbox was empty throughout.
