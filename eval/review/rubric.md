# Reviewability rubric

You are reviewing one finished change to a small Next.js TodoMVC app, made by an autonomous coding agent from the ask below.
Several agents worked the same asks under different setups; you are not told which setup made this change, and it does not matter for your scores.
Score only what is in front of you: the ask, the commits, the diff, and the agent's done summary.
Do not run anything; judge from the text.

Score each criterion from 1 to 5, using the anchors:

1. `change_size`: the change is the size the ask needs. 5: focused, no unrelated edits, refactoring kept apart from behavior changes. 3: some unrelated or oversized edits. 1: sprawling, or mixes unrelated work.
2. `summary_clarity`: a reader learns from the done summary what changed, where, and why. 5: precise and complete. 3: understandable with gaps. 1: missing, vague, or wrong about the diff.
3. `verification_story`: the summary says what was checked and how, and the claims are specific and believable against the diff (tests added or run, builds, manual checks). 5: specific, credible, and covers the risky parts. 3: generic or partial. 1: none, or contradicted by the diff.
4. `follow_ups`: work the ask did not call for is listed as a follow-up rather than built, and known gaps, risks, and unrelated problems noticed are listed honestly, without padding. 5: the change stays within the ask and what lies beyond it is listed usefully and honestly. 3: thin or partly padded, or a small unrequested extra built where it should have been listed. 1: unrequested behavior built instead of listed, none listed where there clearly should be, or misleading. A short "none" for a change that truly leaves nothing open scores 4.
5. `decision_records`: assumptions and choices, especially where the ask was ambiguous, are stated with reasons. 5: every real choice explained. 3: some. 1: none where choices were made.
6. `handoff`: another engineer or agent could pick up from this branch and summary alone and continue confidently. 5: yes, nothing to rediscover. 3: with some digging. 1: no.
7. `code_quality`: readable, consistent with the codebase's existing conventions, no dead code or hacks. 5: clean. 3: acceptable with issues. 1: poor.
8. `tests`: tests the change adds or updates are meaningful for what changed and in the project's existing styles. 5: well-aimed tests of the new behavior. 3: some value. 1: none where they were needed, or tests that check nothing. If the change needed none, score 4.
9. `maintainability`: how easy this change would be to extend or modify next. 5: the next related change would slot in cleanly (clear boundaries, no duplication, names and structure that invite the next feature). 3: workable, with some coupling, duplication, or special cases to untangle first. 1: the next change would mean rewriting much of this one.

Then give `overall` from 1 to 5, as you would approve it in a code review that holds the change to exactly what was asked: 5 approve as is; 4 approve with small nits; 3 approve only after changes, for example when the summary or docs expose the agent's own tooling (its status files, inboxes, or launch mechanics) or describe implementation where behavior belongs, or when tests each check several behaviors at once instead of one; 2 request changes, for example when behavior the ask did not call for was built in, or the verification does not cover what changed; 1 reject.
Add a `notes` string of at most three sentences naming the strongest and weakest points.
Answer with the JSON object only.
