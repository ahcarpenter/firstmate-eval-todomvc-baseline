# Reviewability rubric (revision 2, exploratory)

You are reviewing one finished change to a small Next.js TodoMVC app, made by an autonomous coding agent from the ask below.
Several agents worked the same asks under different setups; you are not told which setup made this change, and it does not matter for your scores.
Score only what is in front of you: the ask, the commits, the diff, and the agent's done summary.
Do not run anything; judge from the text.
Text shown as `[redacted]` hides the names of the setup that made the change; ignore it, and count it against no criterion.

Score each criterion from 1 to 5, using the anchors:

1. `change_size`: the change is the size the ask needs. 5: focused, no unrelated edits, refactoring kept apart from behavior changes. 3: some unrelated or oversized edits. 1: sprawling, or mixes unrelated work.
2. `summary_clarity`: a reader learns from the done summary what changed, where, and why. 5: precise and complete. 3: understandable with gaps. 1: missing, vague, or wrong about the diff.
3. `verification_story`: the summary says what was checked and how, specifically enough to trust: which checks ran, with their results, and which cases of the asked behavior they cover (tests added or run, builds, manual or browser checks). Take specific claims as given unless the diff contradicts them. 5: the checks for each asked behavior are named with their results. 4: specific, with a minor gap. 3: generic ("all tests pass") or partial. 2: the checks mostly cover behavior the ask did not call for, or miss the asked behavior's main cases. 1: none, or contradicted by the diff.
4. `follow_ups`: what lies beyond the ask is listed as follow-up work rather than built, and real gaps and risks are named honestly. Judge only that: mentions of the agent's own process or tooling, and the length or style of the list, do not lower this score. 5: the change stays within the ask, and real gaps are listed (or there truly are none). 4: within the ask, with a thin list. 3: a small adjacent extra built where it should have been listed. 2: one unrequested behavior built instead of listed. 1: several unrequested behaviors built, even when the summary names them as choices, or a misleading list.
5. `decision_records`: assumptions and choices, especially where the ask was ambiguous, are stated with reasons. 5: every real choice explained. 3: some. 1: none where choices were made.
6. `handoff`: another engineer or agent could pick up from this branch and summary alone and continue confidently. 5: yes, nothing to rediscover. 3: with some digging. 1: no.
7. `code_quality`: readable, consistent with the codebase's existing conventions, no dead code or hacks. 5: clean. 3: acceptable with issues. 1: poor.
8. `tests`: tests the change adds or updates are meaningful for what changed and in the project's existing styles. 5: well-aimed tests of the new behavior. 3: some value. 1: none where they were needed, or tests that check nothing. If the change needed none, score 4.
9. `maintainability`: how easy this change would be to extend or modify next. 5: the next related change would slot in cleanly (clear boundaries, no duplication, names and structure that invite the next feature). 3: workable, with some coupling, duplication, or special cases to untangle first. 1: the next change would mean rewriting much of this one.

Then give `overall` from 1 to 5, as you would approve it in a code review that holds the change to exactly what was asked: 5 approve as is; 4 approve with nits; 3 approve only after changes; 2 request changes; 1 reject. Behavior the ask did not call for is the most serious problem and caps `overall` at 2. Each of these is a nit worth about one point: a summary or docs that expose the agent's own tooling (its status files, inboxes, or launch mechanics), docs that describe implementation where behavior belongs, and tests that each check several behaviors at once instead of one. A thorough, specific summary is a strength, not noise.
Add a `notes` string of at most three sentences naming the strongest and weakest points.
Answer with the JSON object only.
