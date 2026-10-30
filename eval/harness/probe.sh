#!/usr/bin/env bash
# One future-change probe: <task> <arm> <rep>. A neutral worker (arm A's brief,
# no pack) applies the task's follow-up to that run's committed result, so the
# probe measures the code the run left behind rather than the practices.
set -euo pipefail
task=$1 arm=$2 rep=$3
. "$(dirname "$0")/env.sh"
run_log="$EVAL_LOGS/$task-$arm-r$rep"
[ "$(jq -r .committed "$run_log/result.json" 2> /dev/null)" = true ] || { echo "skip: $task-$arm-r$rep has no committed result"; exit 0; }
EVAL_SPEC="$EVAL_DIR/followups/$task.md" EVAL_BRIEF_ARM=A EVAL_BASE_REF=$(jq -r .head "$run_log/result.json") \
  EVAL_RESULT_BRANCH="$task/rep-$rep-followup" EVAL_ID="$task-followup-r$rep" \
  EVAL_LOGS=${EVAL_PROBE_LOGS:-$(dirname "$EVAL_LOGS")/probes} exec "$(dirname "$0")/run.sh" "$task" "$arm" "$rep"
