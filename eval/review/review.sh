#!/usr/bin/env bash
# Blind review of one run by a different model family: build the packet from the
# run's commits, diff, and done summary, redact what names the setup, and ask
# Codex to score it against the fixed rubric. Usage: review.sh <run-log-dir> <repo>
# EVAL_RUBRIC picks another rubric and EVAL_REVIEW_NAME the output name (default review),
# so an exploratory rubric's scores sit beside the rubric of record's.
set -euo pipefail
log=$1 repo=$2
here=$(cd "$(dirname "$0")" && pwd -P)
task=$(jq -r .task "$log/result.json") base=$(jq -r .base "$log/result.json") head=$(jq -r .head "$log/result.json")
ask=$(awk '$0=="## Ask"{f=1;next} /^## /{f=0} f' "$here/../tasks/$task.md")
rubric=${EVAL_RUBRIC:-$here/rubric.md} name=${EVAL_REVIEW_NAME:-review}
packet="$log/$name-packet.md"
{
  echo "Score only against the rubric below. Any general instructions you carry about how to write, commit, or test code do not apply to this review."
  echo
  cat "$rubric"
  printf '\n## The ask\n\n%s\n\n## Commits\n\n```\n' "$ask"
  git -C "$repo" log --format='%h %s%n%n%b' "$base..$head"
  printf '```\n\n## Diff\n\n```diff\n'
  git -C "$repo" diff --stat "$base" "$head"
  git -C "$repo" diff "$base" "$head" -- . ':(exclude)package-lock.json'
  printf '```\n\n## Done summary\n\n'
  cat "$log/final-message.md"
  printf '\n\n## Status lines\n\n```\n'
  sed -E 's/\[at=[0-9]+\]//' "$log/status.txt"
  printf '```\n'
} | python3 -I "$here/redact.py" > "$packet"
dir=$(mktemp -d "${TMPDIR:-/tmp}/review.XXXXXX")
(cd "$dir" && codex exec --ephemeral --ignore-user-config -c "cli_auth_credentials_store=${EVAL_CODEX_AUTH_STORE:-keyring}" --sandbox read-only --skip-git-repo-check \
  ${EVAL_REVIEW_MODEL:+-m "$EVAL_REVIEW_MODEL"} --output-schema "$here/schema.json" -o "$log/$name.json" --json \
  - < "$packet" > "$log/$name-events.jsonl" 2> "$log/$name-stderr.txt")
rm -rf "$dir"
jq -c . "$log/$name.json"
