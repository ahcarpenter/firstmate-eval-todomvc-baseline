#!/usr/bin/env bash
# Maintainability measures for one result against its base (BAR.md, amendment 1):
# complexity, duplication, lint warnings, type escape hatches, and the unit-test
# coverage of the changed lines. Usage: maint.sh <repo> <base> <head> <out-dir>
# Env: EVAL_FIXTURE, EVAL_SCRATCH (holding todomvc-cov, the fixture's modules plus
# the Vitest coverage provider, and tools/, holding jscpd).
set -uo pipefail
repo=$1 base=$2 head=$3 out=$4
here=$(cd "$(dirname "$0")" && pwd -P)
mkdir -p "$out" && out=$(cd "$out" && pwd -P)
work=$(mktemp -d "${TMPDIR:-/tmp}/maint.XXXXXX")
trap 'rm -rf "$work"' EXIT
export NEXT_TELEMETRY_DISABLED=1

prepare() { # <commit> <dir>
  mkdir -p "$2" && git -C "$repo" archive "$1" | tar -x -C "$2"
  if cmp -s "$2/package-lock.json" "$EVAL_FIXTURE/package-lock.json"; then
    cp -Rc "$EVAL_SCRATCH/todomvc-cov/node_modules" "$2/node_modules"
  else
    (cd "$2" && npm ci --no-audit --no-fund > /dev/null 2>&1 &&
      npm install --no-save --no-audit --no-fund "@vitest/coverage-v8@$(node -p 'require("vitest/package.json").version')" > /dev/null 2>&1)
  fi
}
measure() { # <dir> <side>
  (cd "$1" && npx eslint -f json --rule '{"complexity": ["warn", 0]}' . > "$out/eslint-$2.json" 2> /dev/null)
  mkdir -p "$out/jscpd-$2"
  (cd "$1" && "$EVAL_SCRATCH/tools/node_modules/.bin/jscpd" --silent --min-tokens 50 --format typescript,tsx \
    --ignore '**/*.test.*,**/*.spec.*,**/e2e/**,**/node_modules/**,**/.next/**' --reporters json --output "$out/jscpd-$2" \
    $(ls -d app components lib 2> /dev/null) > /dev/null 2>&1)
}
prepare "$base" "$work/base" && measure "$work/base" base
prepare "$head" "$work/head" && measure "$work/head" head
(cd "$work/head" && npx vitest run --coverage.enabled --coverage.provider=v8 --coverage.reporter=json \
  --coverage.include='app/**' --coverage.include='components/**' --coverage.include='lib/**' \
  --coverage.reportsDirectory="$out/coverage" > "$out/coverage.log" 2>&1)
git -C "$repo" diff -U0 "$base" "$head" -- . ':(exclude)package-lock.json' > "$out/diff.patch"
python3 -I "$here/maint.py" "$out" "$work/head" > "$out/maint.json"
cat "$out/maint.json"
