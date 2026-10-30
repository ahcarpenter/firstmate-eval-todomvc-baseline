The change is done: if you add a todo that's already on your list and not yet completed, it isn't added again and you get a message saying it's already there. It's committed on branch `fm/dedupe-active-r2` as `a383593`, a clean fast-forward from `main`, and I've reported `done` to firstmate. Lint, typecheck, the 11 unit tests and the 3 end-to-end tests all pass.

How it behaves:
- **What counts as the same todo:** capital letters and extra spaces are ignored, so " buy MILK " matches "Buy milk".
- **Completed todos don't count.** Once you've ticked "Buy milk" off, you can add it again.
- **The message:** a line under the input reads "“Buy milk” is already on your list." Your typed text stays in the box so you can change it, and the message disappears as soon as you edit it. Screen readers announce it too.
- **Editing an existing todo:** renaming a todo to match another one isn't blocked. That wasn't part of the request, so I left it alone.

The matching rule is a new function, `findActiveDuplicate`, in `lib/todos.ts`, and the check and message live in `components/TodoApp.tsx`. The message styling is a new file, `app/globals.css`, loaded from `app/layout.tsx`. I added tests for both the blocked case and the after-completion case. I didn't look at the message in a browser myself; it has only been checked by the automated tests.
