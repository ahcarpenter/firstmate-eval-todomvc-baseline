# firstmate-eval-todomvc-baseline

Builds from an evaluation of [firstmate](https://github.com/kunchenguid/firstmate)'s best-practices adapter.
The same autonomous worker (Claude Code with Claude Opus 5.5 at medium effort, launched the way firstmate launches its workers) carried out the same tasks on the same small Next.js TodoMVC app, with and without the adapter for Addy Osmani's agent-skills pack.

This repository holds the baseline arm: firstmate's worker brief without the adapter.
The other arm is the agent-skills arm: https://github.com/ahcarpenter/firstmate-eval-todomvc-agent-skills.
The method, the results, and the verdict are in the evidence report in firstmate's evidence pull request; the bar it applies is `eval/BAR.md` here.

## What is here

- `main`: the starting app (its first two commits), then repetition 1 of the seven-link dependent chain, each link a new worker building on the previous result: due dates, overdue marking, changing a date while editing, sorting by date, "Due today" and "Due tomorrow", search, and moving overdue todos to today. The last commit adds this README and `eval/`.
- `<task>/rep-<n>` (repetitions 1 to 3): one run's result. Paired tasks start from the starting app; chain links start from the same repetition's previous link. The last commit on each branch adds `DONE-SUMMARY.md`, the worker's own summary, unedited; every commit before it is the worker's.
- `<task>/rep-<n>-followup`: a future-change probe, in which a neutral worker (the baseline brief, no pack) applies a follow-up change to that run's result, to measure how easy the code it left is to build on.
- `eval/`: the bar, written before the first run with its one amendment; the task asks (`tasks/`) and follow-up asks (`followups/`); the hidden acceptance tests, the TodoMVC regression suite, and the grader (`grader/`, with `FIXES.md` listing the tests corrected after the runs); the blind-review rubrics, redaction, and calibration record (`review/`); the practice grade (`practice/`); the harness and seeded run orders (`harness/`, with its own README); and the computed statistics with each run's grade and review scores (`results/`).

The runs never saw `eval/`; it was added after every result was graded.

## Compare a build with the other arm

```sh
git remote add other https://github.com/ahcarpenter/firstmate-eval-todomvc-agent-skills.git
git fetch other
git diff other/multiple-lists/rep-1 multiple-lists/rep-1 -- . ':(exclude)DONE-SUMMARY.md'
```

## Re-grade a result

The grader needs Node.js 24, npm, and Playwright's Chromium (`npx playwright install chromium` inside `eval/grader` after installing `@playwright/test`).
It exports the commit into a fresh directory, runs the project's own lint, typecheck, unit tests, and build, starts the production build, and runs the regression suite and the task's hidden tests against it:

```sh
EVAL_FIXTURE=/nonexistent eval/grader/grade.sh . multiple-lists/rep-1 multiple-lists out/multiple-lists-rep-1
```

`EVAL_FIXTURE` may name a checkout of the starting app with its dependencies installed, to reuse them when a result's lockfile is unchanged; any other path installs dependencies afresh.
Add `GRADE_PRIOR=due-dates,overdue` (and so on) to also run earlier chain links' hidden tests, or `GRADE_FOLLOWUP=<task>` to run a follow-up's.
`out/.../summary.json` holds the result.
