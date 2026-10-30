Multiple named lists are working and committed on `fm/multiple-lists-r1` as `058c44b`, one commit on top of `main`. Lint, typecheck, the 15 unit tests and the 4 end-to-end tests all pass, and the status file now says done.

- **Creating lists:** a field labelled "New list name" creates a list when you press Enter and switches to it. Every list appears as a link, and the current one is highlighted.
- **Separate lists:** each list keeps its own todos, and the filters and counters only look at the current list.
- **URLs:** `/lists/<id>`, `/lists/<id>/active` and `/lists/<id>/completed` work. `/` opens the first list. The old `/active` and `/completed` URLs still work and show the first list. An unknown list id shows the not-found page.
- **Existing todos:** todos saved under the old `todos-nextjs` key become a list called "Todos". If there's nothing saved, the app starts with an empty "Todos" list.

Things to know:
- **New storage key:** lists are saved under `todolists-nextjs`. The old key is only read, never deleted, so the migration can't destroy anything.
- **Extra fix:** `nextId` used to compute the next todo id as the count plus one, which reuses an id after a delete. It now uses the highest id plus one. This wasn't in the brief, but duplicate ids break toggling and editing.
- **Not checked visually:** I didn't look at the new list section in a browser, so its styling hasn't been checked by eye. The end-to-end tests only check behaviour.

New tests are in `lib/lists.test.ts` and `e2e/lists.spec.ts`, and the README describes the new routes and storage key. The task inbox was empty. Nothing was pushed.
