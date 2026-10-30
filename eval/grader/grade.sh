#!/usr/bin/env bash
# Grade one committed result: export <commit> of <repo> into a fresh directory,
# run the project's own checks, build and start it, and run the regression
# suite plus the task's hidden acceptance tests against it.
# Usage: grade.sh <repo> <commit> <task-id|none> <out-dir>
# GRADE_PRIOR (comma-separated task ids) adds earlier chain links' hidden specs and
# GRADE_FOLLOWUP (a task id) adds that task's follow-up spec; each is summarized on
# its own, so the task's own hidden score is unchanged.
# Env: EVAL_FIXTURE (the fixture checkout whose node_modules a run with an
# unchanged lockfile reuses), PLAYWRIGHT_BROWSERS_PATH.
set -uo pipefail
repo=$1 commit=$2 task=$3 out=$4
here=$(cd "$(dirname "$0")" && pwd -P)
mkdir -p "$out"
out=$(cd "$out" && pwd -P)
work=$(mktemp -d "${TMPDIR:-/tmp}/grade.XXXXXX")
trap 'kill "${server:-}" 2>/dev/null; wait "${server:-}" 2>/dev/null; rm -rf "$work"' EXIT

git -C "$repo" archive "$commit" | tar -x -C "$work/" || { echo '{"error":"export failed"}' > "$out/summary.json"; exit 1; }
if cmp -s "$work/package-lock.json" "$EVAL_FIXTURE/package-lock.json"; then
  cp -Rc "$EVAL_FIXTURE/node_modules" "$work/node_modules"
  deps=reused
else
  (cd "$work" && npm ci --no-audit --no-fund > "$out/npm-ci.log" 2>&1) && deps=installed || deps=failed
fi

check() { # name command...
  local name=$1; shift
  if (cd "$work" && "$@" > "$out/$name.log" 2>&1); then echo pass; else echo fail; fi
}
lint=$(check lint npm run lint)
typecheck=$(check typecheck npm run typecheck)
unit=$(check unit npx vitest run --reporter=json --outputFile="$out/unit.json")
build=$(check build npm run build)

specs=regression.spec.ts
[ "$task" = none ] || specs="$specs,tasks/$task.spec.ts"
for p in $(tr ',' ' ' <<< "${GRADE_PRIOR:-}"); do specs="$specs,tasks/$p.spec.ts"; done
[ -z "${GRADE_FOLLOWUP:-}" ] || specs="$specs,followups/$GRADE_FOLLOWUP.spec.ts"
e2e=skipped
if [ "$build" = pass ]; then
  port=$(( 4100 + RANDOM % 800 ))
  (cd "$work" && exec npx next start -p "$port" > "$out/server.log" 2>&1) &
  server=$!
  for _ in $(seq 1 60); do curl -sf "http://localhost:$port/" > /dev/null && break; sleep 1; done
  GRADE_BASE_URL="http://localhost:$port" GRADE_SPECS="$specs" GRADE_OUT="$out" \
    npx --prefix "$here" playwright test --config "$here/playwright.config.ts" > "$out/e2e.log" 2>&1
  e2e=ran
fi

count() { if [ -f "$here/$1" ]; then grep -cE "$2" "$here/$1" || true; else echo 0; fi; }
regtotal=$(count regression.spec.ts '^ *test\(')
alltask=$(count "tasks/$task.spec.ts" '^ *test\(')
edgetotal=$(count "tasks/$task.spec.ts" '^ *test\(".*@edge')
totals=$(for f in $(tr ',' ' ' <<< "$specs"); do printf '%s\t%s\t%s\n' "$f" "$(count "$f" '^ *test\(')" "$(count "$f" '^ *test\(".*@edge')"; done |
  jq -R -s 'split("\n") | map(select(length > 0) | split("\t") | {key: .[0], value: {all: (.[1] | tonumber), edge: (.[2] | tonumber)}}) | from_entries')
jq -n --argjson totals "$totals" --arg own "tasks/$task.spec.ts" --arg followup "followups/${GRADE_FOLLOWUP:-}.spec.ts" --argjson regtotal "$regtotal" --argjson hidtotal "$((alltask - edgetotal))" --argjson edgetotal "$edgetotal" --arg commit "$commit" --arg task "$task" --arg deps "$deps" --arg lint "$lint" --arg typecheck "$typecheck" \
  --arg unit "$unit" --arg build "$build" --arg e2e "$e2e" --slurpfile unitjson <(cat "$out/unit.json" 2>/dev/null || echo '{}') \
  --slurpfile r <(cat "$out/results.json" 2>/dev/null || echo '{}') '
  def specs: [$r[0] | .. | objects | select(has("tests") and has("title") and has("ok")) | {title, file: (.file // ""), edge: (.title | test("@edge")), ok}];
  (specs) as $s
  | ($s | map(select(.file | startswith("regression")))) as $reg
  | ($s | map(select(.file == $own))) as $owntests
  | def block($f): ($s | map(select(.file == $f))) as $x
      | {passed: ($x | map(select(.ok and (.edge | not))) | length), total: (($totals[$f].all // 0) - ($totals[$f].edge // 0)),
         passed_titles: ($x | map(select(.ok and (.edge | not)) | .title)), failed: ($x | map(select((.ok | not) and (.edge | not)) | .title))};
  {commit: $commit, task: $task, deps: $deps, checks: {lint: $lint, typecheck: $typecheck, unit: $unit, build: $build},
     unit_tests: ($unitjson[0].numTotalTests // null), unit_failed: ($unitjson[0].numFailedTests // null), e2e: $e2e,
     regression: {passed: ($reg | map(select(.ok)) | length), total: $regtotal, failed: ($reg | map(select(.ok | not) | .title))},
     hidden: {passed: ($owntests | map(select(.ok and (.edge | not))) | length),
              total: $hidtotal,
              failed: ($owntests | map(select((.ok | not) and (.edge | not)) | .title))},
     edge: {passed: ($owntests | map(select(.ok and .edge)) | length),
            total: $edgetotal,
            failed: ($owntests | map(select((.ok | not) and .edge) | .title))},
     hidden_passed_titles: ($owntests | map(select(.ok and (.edge | not)) | .title)),
     regression_passed_titles: ($reg | map(select(.ok) | .title)),
     prior: ($totals | keys | map(select(startswith("tasks/") and . != $own)) | map({key: (ltrimstr("tasks/") | rtrimstr(".spec.ts")), value: block("tasks/" + (ltrimstr("tasks/")))}) | from_entries),
     followup: (if $followup == "followups/.spec.ts" then null else block($followup) end)}' > "$out/summary.json"
cat "$out/summary.json"
