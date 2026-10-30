# Practice checklist

You are reading how an autonomous coding agent worked one change to a small Next.js TodoMVC app: the ask, the files the change touched, the agent's done summary and status lines, and a numbered summary of every step it took (each tool call with its command and whether it succeeded, and what the agent said).
Several agents worked the same asks under different setups; you are not told which setup this was, and it does not matter for your answers.
Judge only whether each practice below was applied while the work happened, from the steps, not whether the result is good.
Do not run anything.

For each practice, answer `status` as one of `applied`, `partly applied`, `not applied`, or `not applicable`, cite the step numbers that show it in `evidence` (an empty list when nothing shows it), and give a `note` of at most one sentence.

- `reproduce_first`: on a bug fix only, the agent made the failure happen before changing the code: a test that failed, or a run or browser check that showed the bug, before the fix. Not applicable to anything but a bug fix.
- `assumptions_recorded`: on an underspecified ask only (one that leaves what to build open), the agent asked (a `needs-decision` status line) or wrote down its reading of the ask and its assumptions before building, and named them in the done summary. Not applicable when the ask is specific.
- `stack_discovery`: before relying on checks, the agent found the project's own check commands (its package scripts or README) rather than inventing its own.
- `incremental_slices`: the agent built the change in small steps, checking as it went, rather than writing everything and checking only at the end. Not applicable when the whole change is one small edit.
- `self_review`: before reporting done, the agent reviewed its own change: read its diff, or reasoned through its correctness, edge cases, and readability.
- `simplification_pass`: after the checks passed, the agent made a behavior-preserving cleanup of its own change and ran the checks again.
- `test_experiment`: the agent checked that its tests can fail: it broke the change on purpose and saw a test fail, or saw a new test fail before the fix, then restored it. Not applicable when it wrote or changed no tests.
- `docs_where_behavior_changed`: the agent updated the README or other docs where the change made them stale. Not applicable when nothing documented changed.
- `scope_kept`: the change stays within the ask; unrelated problems the agent noticed are listed rather than fixed in this change.
- `verification_story`: the done summary says which checks ran and their results, and what was checked by hand.
- `hand_check`: the agent exercised the changed behavior in a running app, in a browser or with an end-to-end test, before reporting done. Not applicable when the change has no visible behavior.

Answer with the JSON object only.
