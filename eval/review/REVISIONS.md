# Rubric revisions

The bar's calibration rule (BAR.md, amendment 1): a criterion where the owner's blind scores and the Codex reviewer's differ by 1.0 point or more on average (0.75 or more for the overall score) is rewritten, the change is recorded here, and every run is re-scored with the revised rubric before any reviewer number is read.

## Revision 1, 2026-10-30, after calibration round 1

Six runs, three per arm, six tasks, drawn with seed 20261101. Mean absolute difference, Codex against the owner: change size 0.00, summary clarity 0.67, verification story 0.83, follow-ups 1.00, decision records 0.67, handoff 0.83, code quality 0.67, tests 0.50, maintainability 0.67, overall 0.83.
Material: `follow_ups` and `overall`. Only those two were rewritten.

- `follow_ups`, before: "known gaps, risks, and unrelated problems noticed are listed honestly, without padding. 5: useful and honest. 3: thin or partly padded. 1: none where there clearly should be, or misleading."
  After: building work the ask did not call for, instead of listing it as a follow-up, now counts against this criterion. The owner scored 1 a change that built two unrequested behaviors; Codex scored it 4.
- `overall`, before: "as you would approve it in a code review."
  After: anchored to a review that holds the change to exactly what was asked, with the owner's stated reasons for withholding approval as examples: unrequested behavior (request changes), and a summary or docs that expose the agent's own tooling or describe implementation where behavior belongs, or tests that each check several behaviors at once (approve only after changes).

## Check after revision 1 (not a revision)

The same six runs re-scored with revision 1. Mean absolute difference, Codex against the owner: change size 0.33, summary clarity 0.83, verification story 1.00, follow-ups 1.17, decision records 0.67, handoff 0.50, code quality 0.83, tests 0.17, maintainability 0.83, overall 0.83.
- Follow-ups overcorrected: Codex now scores below the owner (mean signed difference -0.83), giving 3 where the owner gave 5 on two changes.
- Overall stays at 0.83, with the bias near zero (-0.17).
- Verification story and handoff moved by 0.17 to 0.33 although their text did not change: one Codex score per run varies by about that much on re-scoring alone, which is close to the threshold at six runs.
The bar allows one revision, so revision 1 stays the rubric of record. The reviewer's scores are reported with this agreement beside them, and a second revision would be exploratory.

## Revision 2, 2026-10-30, exploratory, on the owner's word

Rewrites `follow_ups` (scope only: unrequested behavior built instead of listed; process mentions no longer count), `verification_story` (specific claims taken as given unless the diff contradicts them; checks named per asked behavior), and `overall` (unrequested behavior caps it at 2; leaked tooling, implementation-style docs, and multi-behavior tests each cost about a point; a thorough summary is a strength), and tells the reviewer to ignore `[redacted]` markers. File: `rubric-r2.md`; scores sit beside revision 1's as `review-r2.json`.
Check on the same six runs, mean absolute difference from the owner (original / revision 1 / revision 2): follow-ups 1.00 / 1.17 / 0.17; verification story 0.83 / 1.00 / 1.00; overall 0.83 / 0.83 / 1.00; mean over all ten criteria 0.67 / 0.72 / 0.60.
Revision 2 brings follow-ups close and is the nearest of the three overall, but leaves verification (now generous, +1.00) and the overall score (1.00) beyond the threshold. Revision 1 stays the rubric of record.
