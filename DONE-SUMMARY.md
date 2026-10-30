Multiple named lists are in, committed on `fm/multiple-lists-r2` (`1fa4e70`), one commit on top of `main`. Lint, typecheck, the 15 unit tests and the 6 end-to-end tests all pass, and a screenshot of the running app looks right. I logged `done: ready in branch fm/multiple-lists-r2` to the status file. Nothing was pushed, the worktree is clean, and the task inbox was empty.

What works now:
- **Creating lists:** typing a name into the "New list name" field and pressing Enter creates the list and switches to it. Every list shows as a link at the top of the page, with the current one highlighted.
- **Per-list todos:** each list has its own todos, and the All/Active/Completed filters and the "items left" counter apply only to the current list.
- **URLs:** lists live at `/lists/<id>`, `/lists/<id>/active` and `/lists/<id>/completed`. `/` opens the first list. The old `/active` and `/completed` addresses also open the first list with that filter. Any other filter word in the address gives a 404.
- **Existing data:** todos saved under the old `todos-nextjs` key become a list called "Todos". I left the old key in place rather than deleting it, so it is still there if the change needs undoing. Lists are saved under a new key, `todos-nextjs-lists`.

Choices I made that the spec didn't cover:
- **Fresh visitors** start with an empty "Todos" list, so `/` always has a first list to open.
- **List IDs are numbers** (`1`, `2`, …) rather than words made from the name. Two lists can therefore share a name, and names with odd characters don't affect the URL.
- **Unknown list ID:** an address with a list ID that doesn't exist shows "This list does not exist." along with the list links.
- **There's no way to rename or delete a list**, since none was asked for.
- **A fix to an existing bug:** new IDs used to be "number of items + 1", so deleting a todo and adding another could give two todos the same ID. They are now "highest ID + 1".

I also updated the Layout section of `README.md` to describe the new routes and storage keys.
