#!/usr/bin/env bash
# Run a project's own tests as of one commit against the code of another: export
# <code-commit>, replace its unit and end-to-end tests (and their configs) with
# <tests-commit>'s, and run them. Usage: own-tests.sh <repo> <code-commit> <tests-commit> <out-dir>
# Writes unit.json (Vitest) and e2e.json (the project's Playwright config, which builds
# and starts the app on PORT), and own-tests.json, the passing and failing test names.
set -uo pipefail
repo=$1 code=$2 tests=$3 out=$4
mkdir -p "$out" && out=$(cd "$out" && pwd -P)
work=$(mktemp -d "${TMPDIR:-/tmp}/owntests.XXXXXX")
trap 'rm -rf "$work"' EXIT
export NEXT_TELEMETRY_DISABLED=1
is_test='(\.test\.[cm]?[jt]sx?$|^e2e/|^(vitest|playwright)\.config\.[cm]?[jt]s$)'
git -C "$repo" archive "$code" | tar -x -C "$work"
(cd "$work" && git -C "$repo" ls-tree -r --name-only "$code" | grep -E "$is_test" | xargs rm -f)
git -C "$repo" ls-tree -r --name-only "$tests" | grep -E "$is_test" > "$out/test-files.txt"
[ ! -s "$out/test-files.txt" ] || git -C "$repo" archive "$tests" -- $(cat "$out/test-files.txt") | tar -x -C "$work"
if cmp -s "$work/package-lock.json" "$EVAL_FIXTURE/package-lock.json"; then
  cp -Rc "$EVAL_FIXTURE/node_modules" "$work/node_modules"
else
  (cd "$work" && npm ci --no-audit --no-fund > "$out/npm-ci.log" 2>&1)
fi
(cd "$work" && perl -e 'alarm shift; exec @ARGV' 600 npx vitest run --reporter=json --outputFile="$out/unit.json" > "$out/unit.log" 2>&1)
port=$(( 5100 + RANDOM % 800 ))
(cd "$work" && PORT=$port perl -e 'alarm shift; exec @ARGV' 900 npx playwright test --reporter=json > "$out/e2e.json" 2> "$out/e2e.log")
jq -n --slurpfile u <(cat "$out/unit.json" 2> /dev/null || echo '{}') --slurpfile e <(cat "$out/e2e.json" 2> /dev/null || echo '{}') '
  ([$u[0].testResults[]?.assertionResults[]? | {name: ("unit: " + (.ancestorTitles + [.title] | join(" > "))), ok: (.status == "passed")}]) as $unit
  | ([$e[0] | .. | objects | select(has("tests") and has("title") and has("ok")) | {name: ("e2e: " + (.file // "") + " > " + .title), ok}]) as $e2e
  | ($unit + $e2e) as $all
  | {passed: [$all[] | select(.ok) | .name], failed: [$all[] | select(.ok | not) | .name],
     unit_ran: ($u[0].numTotalTests // null), e2e_ran: ($e2e | length)}' > "$out/own-tests.json"
cat "$out/own-tests.json" | jq -c '{passed: (.passed | length), failed: (.failed | length)}'
