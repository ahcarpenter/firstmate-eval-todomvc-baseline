#!/usr/bin/env bash
# The blind Codex reviews of every paired run: the rubric review of each committed
# change, then the practice grade of every run. Re-running skips finished reviews.
# Stops before the Codex window runs out (EVAL_MIN_CODEX percent remaining, default 5).
set -uo pipefail
here=$(cd "$(dirname "$0")" && pwd -P)
. "$here/env.sh"
# One review pass at a time: a second caller waits, then skips what the first finished.
until mkdir "$EVAL_SCRATCH/review-all.lock" 2> /dev/null; do sleep 60; done
trap 'rmdir "$EVAL_SCRATCH/review-all.lock"' EXIT
codex_left() { quota-axi --provider codex --json 2> /dev/null | jq -r '[.providers[]?.windows[]?.percentRemaining] | min // 100'; }
# Only the 54 paired runs are reviewed; the chain's later links are measured, not reviewed.
paired() { ! grep -q '^chain: [3-7] of 7' "$EVAL_DIR/tasks/$(jq -r .task "$1/result.json").md"; }
# Run directories in a seeded random order (macOS sort -R takes no seed from a pipe).
shuffled() { ls -d "$EVAL_LOGS"/*/ | python3 -I -c 'import random, sys; rows = sys.stdin.read().split(); random.Random(int(sys.argv[1])).shuffle(rows); print("\n".join(rows))' "$1"; }
room() { local left; left=$(codex_left); [ "${left%.*}" -ge "${EVAL_MIN_CODEX:-5}" ] || { echo "Codex window at $left% remaining; stopping" >&2; return 1; }; }

for log in $(shuffled 20261102); do
  log=${log%/}
  [ "$(jq -r .committed "$log/result.json" 2> /dev/null)" = true ] && [ ! -s "$log/review.json" ] && paired "$log" || continue
  room || exit 1
  bash "$EVAL_DIR/review/review.sh" "$log" "$(arm_repo "$(jq -r .arm "$log/result.json")")" > /dev/null || echo "review failed: $log" >&2
done
for log in $(shuffled 20261103); do
  log=${log%/}
  [ -f "$log/result.json" ] && [ ! -s "$log/practice.json" ] && paired "$log" || continue
  room || exit 1
  bash "$EVAL_DIR/practice/judge.sh" "$log" "$(arm_repo "$(jq -r .arm "$log/result.json")")" > /dev/null || echo "practice review failed: $log" >&2
done
# Exploratory, on the owner's word: every paired run re-scored with rubric revision 2.
for log in $(shuffled 20261104); do
  log=${log%/}
  [ "$(jq -r .committed "$log/result.json" 2> /dev/null)" = true ] && [ ! -s "$log/review-r2.json" ] && paired "$log" || continue
  room || exit 1
  EVAL_RUBRIC="$EVAL_DIR/review/rubric-r2.md" EVAL_REVIEW_NAME=review-r2 \
    bash "$EVAL_DIR/review/review.sh" "$log" "$(arm_repo "$(jq -r .arm "$log/result.json")")" > /dev/null || echo "review failed: $log" >&2
done
echo "$(date -u +%FT%TZ) reviews finished"
