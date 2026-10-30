#!/usr/bin/env bash
# The comparison: analyze.py over the 54 paired runs (BAR.md as first written),
# then analyze2.py over everything its amendment adds. Usage: analyze-all.sh <out-dir>
set -uo pipefail
out=$1
here=$(cd "$(dirname "$0")" && pwd -P)
. "$here/env.sh"
mkdir -p "$out" && paired="$out/paired-logs" && rm -rf "$paired" && mkdir -p "$paired"
for task in fix-duplicate-ids refactor-state a11y-keyboard completed-count dedupe-active undo-delete multiple-lists due-dates overdue; do
  for d in "$EVAL_LOGS/$task"-[AB]-r*/; do [ -d "$d" ] && ln -s "${d%/}" "$paired/"; done
done
python3 -I "$here/analyze.py" "$paired" "$out" "$(arm_repo A)" "$(arm_repo B)" > "$out/analyze.log" 2>&1 || exit 1
python3 -I "$here/analyze2.py" "$EVAL_LOGS" "${EVAL_PROBE_LOGS:-$(dirname "$EVAL_LOGS")/probes}" "$out" > "$out/analyze2.log" 2>&1 || exit 1
echo "$(date -u +%FT%TZ) analysis written to $out"
