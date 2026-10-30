#!/usr/bin/env bash
# After the paired runs: the chain's later links, then the future-change probes,
# under the same quota handling; then grading, the blind reviews, and the analysis.
# Each later stage is its own script, read when it starts, and waits for its flag
# in EVAL_SCRATCH (grade.ready, reviews.ready) so it can be finished while runs go on.
# Usage: finish.sh <analysis-out-dir>
set -uo pipefail
out=$1
here=$(cd "$(dirname "$0")" && pwd -P)
. "$here/env.sh"
hold() { # a stopped stage leaves the launcher waiting rather than reporting success
  echo "$(date -u +%FT%TZ) $1 stopped; holding" >&2
  exec sleep 31536000
}
await() { while [ ! -e "$EVAL_SCRATCH/$1" ]; do sleep 300; done; }

echo "$(date -u +%FT%TZ) chain links"
bash "$here/drive.sh" "$here/chain-plan.tsv" || hold "the chain"
echo "$(date -u +%FT%TZ) future-change probes"
EVAL_RUNNER="$here/probe.sh" bash "$here/drive.sh" "$here/probe-plan.tsv" || hold "the probes"
await grade.ready
echo "$(date -u +%FT%TZ) grading"
bash "$here/grade-all.sh" || hold "grading"
await reviews.ready
echo "$(date -u +%FT%TZ) blind reviews"
bash "$here/review-all.sh" || hold "the reviews"
echo "$(date -u +%FT%TZ) analysis"
bash "$here/analyze-all.sh" "$out" || hold "the analysis"
