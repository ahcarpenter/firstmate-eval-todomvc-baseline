The todo footer now shows how many todos are completed. It's committed on branch `fm/completed-count-r2` as `648e50b`, and I've reported it done to firstmate.

- **What changed:** the counter now reads like "1 item left · 2 completed", and shows "0 completed" when none are done. It sits in the existing count text on the left of the footer, so the rest of the footer layout is unchanged. The change is in `components/TodoApp.tsx`.
- **Tests:** in `e2e/smoke.spec.ts` I updated the existing smoke test for the new text and added a test that completes two of three todos and checks the count. Lint, typecheck, the unit tests (7) and the end-to-end tests (2) all pass.

The branch fast-forwards cleanly onto `main` and the worktree is clean. Per the delivery rules, nothing was pushed and no PR was opened.
