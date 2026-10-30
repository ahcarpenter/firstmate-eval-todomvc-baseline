#!/usr/bin/env bash
# Grade every result once (BAR.md and its amendment): paired runs and chain links,
# each with the earlier chain links' hidden tests; probes with their follow-up's;
# then the maintainability measures, the probes' rewrite fractions, the test-value
# checks, and the practice grade's mechanical part. Re-running skips finished work.
set -uo pipefail
here=$(cd "$(dirname "$0")" && pwd -P)
. "$here/env.sh"
grader=$EVAL_DIR/grader
probes=${EVAL_PROBE_LOGS:-$(dirname "$EVAL_LOGS")/probes}
chain=(due-dates overdue edit-due-date sort-by-due due-soon search reschedule-overdue)
export NEXT_TELEMETRY_DISABLED=1

field() { jq -r ".$2" "$1/result.json"; }
committed() { [ "$(field "$1" committed)" = true ]; }
# The chain links before <task>, comma-separated; empty off the chain.
prior_of() {
  local out=() c
  for c in "${chain[@]}"; do [ "$c" = "$1" ] && { local IFS=,; echo "${out[*]-}"; return; }; out+=("$c"); done
}
previous_link() { local i; for i in "${!chain[@]}"; do [ "${chain[$i]}" = "$1" ] && [ "$i" -gt 0 ] && echo "${chain[$((i - 1))]}"; done; return 0; }

for log in "$EVAL_LOGS"/*/ "$probes"/*/; do
  log=${log%/}
  [ -f "$log/result.json" ] && committed "$log" && [ ! -s "$log/grade/summary.json" ] || continue
  task=$(field "$log" task)
  followup=; case $log in "$probes"/*) followup=$task ;; esac
  echo "$(date -u +%FT%TZ) grade $(basename "$(dirname "$log")")/$(basename "$log")"
  GRADE_PRIOR=$([ -n "$followup" ] || prior_of "$task") GRADE_FOLLOWUP=$followup \
    bash "$grader/grade.sh" "$(arm_repo "$(field "$log" arm)")" "$(field "$log" head)" "$task" "$log/grade" > /dev/null
done

for log in "$EVAL_LOGS"/*/; do
  log=${log%/}
  [ -f "$log/result.json" ] && committed "$log" && [ ! -s "$log/maint/maint.json" ] || continue
  bash "$grader/maint.sh" "$(arm_repo "$(field "$log" arm)")" "$(field "$log" base)" "$(field "$log" head)" "$log/maint" > /dev/null
done

for log in "$probes"/*/; do
  log=${log%/}
  [ -f "$log/result.json" ] && committed "$log" && [ ! -s "$log/rewrite.json" ] || continue
  run=$EVAL_LOGS/$(basename "$log")
  python3 -I "$grader/rewrite.py" "$(arm_repo "$(field "$log" arm)")" "$(field "$run" base)" "$(field "$run" head)" "$(field "$log" head)" > "$log/rewrite.json"
done

# Test value: chain links against the link before, probes against their run.
for log in "$EVAL_LOGS"/*/ "$probes"/*/; do
  log=${log%/}
  [ -f "$log/result.json" ] && committed "$log" && [ -s "$log/grade/summary.json" ] && [ ! -s "$log/testvalue/testvalue.json" ] || continue
  case $log in
    "$probes"/*) earlier=$EVAL_LOGS/$(basename "$log") ;;
    *) # the nearest earlier link that changed anything; an unchanged link left its base as is
       prev=$(field "$log" task) earlier=
       while prev=$(previous_link "$prev") && [ -n "$prev" ]; do
         earlier=$EVAL_LOGS/$prev-$(field "$log" arm)-r$(field "$log" rep)
         committed "$earlier" && break
       done
       [ -n "$earlier" ] || continue ;;
  esac
  [ -s "$earlier/grade/summary.json" ] || continue
  python3 -I "$grader/testvalue.py" "$(arm_repo "$(field "$log" arm)")" "$(field "$earlier" head)" "$earlier/grade/summary.json" \
    "$(field "$log" head)" "$log/grade/summary.json" "$log/testvalue" > /dev/null
done

for log in "$EVAL_LOGS"/*/; do
  [ -f "$log/result.json" ] && python3 -I "$EVAL_DIR/practice/extract.py" "${log%/}" > /dev/null
done
echo "$(date -u +%FT%TZ) grading finished"
