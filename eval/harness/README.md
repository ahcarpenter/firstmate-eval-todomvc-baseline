# Running the evaluation

These scripts ran the evaluation this repository records.
`finish.sh` shows the order after the paired runs: `drive.sh` over a plan, then `grade-all.sh`, `review-all.sh`, and `analyze-all.sh`.
Start the paired runs with `bash eval/harness/drive.sh eval/harness/plan.tsv`.

## Needs

Bash, Python 3, Node.js 24, npm, jq, git, Claude Code 2.1.312, the Codex CLI for the blind reviews, `quota-axi` for the usage-window checks, and Playwright's Chromium.
The scratch root also holds the fixture checkout, a copy of agent-skills 0.6.14, and an arm repository for each arm.

## Required variables

| Variable | Meaning |
| --- | --- |
| `EVAL_SCRATCH` | Scratch root for the fixture, pack copy, browsers, arm repositories, and run copies |
| `EVAL_FMROOT` | A checkout of the firstmate commit under test |
| `EVAL_LOGS` | Durable per-run log directory |
| `EVAL_NODE_BIN` | The Node.js installation's bin directory |
| `EVAL_CLAUDE` | The Claude Code binary |

## Optional variables

| Variable | Meaning | Default |
| --- | --- | --- |
| `EVAL_EXTRA_PATH` | Colon-separated directories added to each run's `PATH`, for tools outside the system directories | none |
| `EVAL_TMP_ROOT` | Scratch root whose paths are replaced before a blind practice review | the system temporary directory |
| `EVAL_DIR` | The `eval/` directory | the parent of this folder |
| `EVAL_FIXTURE`, `EVAL_PACK`, `EVAL_REPOS`, `EVAL_RUNS` | Locations under the scratch root | see `env.sh` |
| `EVAL_PROBE_LOGS` | Probe log directory | `probes` beside `EVAL_LOGS` |
| `EVAL_MODEL`, `EVAL_EFFORT` | Worker model and effort | `claude-opus-5-5`, `medium` |
| `EVAL_RUN_TIMEOUT`, `EVAL_MAX_STEERS` | Per-segment limit in seconds, and steers per run | `3600`, `2` |
| `EVAL_MIN_FIVE_HOUR`, `EVAL_MIN_CODEX` | Percent of a usage window to keep before starting more work | `20`, `5` |
| `EVAL_REVIEW_MODEL`, `EVAL_CODEX_AUTH_STORE` | Codex model and credential store | Codex's default, `keyring` |
| `EVAL_RUBRIC`, `EVAL_REVIEW_NAME` | Another rubric, and the output name for its scores | `rubric.md`, `review` |
| `EVAL_STATUS`, `EVAL_FM_HOME` | Optional status file and firstmate home that hear about usage-window waits | none |

`PLAYWRIGHT_BROWSERS_PATH` defaults to `ms-playwright` under the scratch root.

## Results

`../results/analysis/` holds the computed statistics and per-run CSVs.
`../results/runs/` holds each run's grade summary, blind reviews, practice grade, and maintainability measures.
`../results/probes/` holds each probe's grade summary and rewrite fraction.
Session transcripts and launch briefs are not published.
