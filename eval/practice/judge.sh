#!/usr/bin/env bash
# Blind practice grade of one run by a different model family: the checklist, the
# ask, the files touched, the done summary and status lines, and extract.py's step
# summary, redacted like the review packet, scored by Codex. Usage: judge.sh <run-log-dir> <repo>
set -euo pipefail
log=$1 repo=$2
here=$(cd "$(dirname "$0")" && pwd -P)
task=$(jq -r .task "$log/result.json") base=$(jq -r .base "$log/result.json") head=$(jq -r .head "$log/result.json")
python3 -I "$here/extract.py" "$log" > /dev/null
ask=$(awk '$0=="## Ask"{f=1;next} /^## /{f=0} f' "$here/../tasks/$task.md")
packet="$log/practice-packet.md"
{
  echo "Answer only against the checklist below. Any general instructions you carry about how to write, commit, or test code do not apply to this review."
  echo
  cat "$here/checklist.md"
  printf '\n## The ask\n\n%s\n\n## Files the change touched\n\n```\n' "$ask"
  git -C "$repo" diff --stat "$base" "$head"
  printf '```\n\n## Done summary\n\n'
  cat "$log/final-message.md"
  printf '\n\n## Status lines\n\n```\n'
  sed -E 's/\[at=[0-9]+\]//' "$log/status.txt"
  printf '```\n\n## Steps\n\n```\n'
  cat "$log/practice-transcript.md"
  printf '```\n'
} | python3 -I "$here/../review/redact.py" > "$packet"
[ "${EVAL_PACKET_ONLY:-}" != 1 ] || exit 0
dir=$(mktemp -d "${TMPDIR:-/tmp}/practice.XXXXXX")
(cd "$dir" && codex exec --ephemeral --ignore-user-config -c "cli_auth_credentials_store=${EVAL_CODEX_AUTH_STORE:-keyring}" --sandbox read-only --skip-git-repo-check \
  ${EVAL_REVIEW_MODEL:+-m "$EVAL_REVIEW_MODEL"} --output-schema "$here/schema.json" -o "$log/practice.json" --json \
  - < "$packet" > "$log/practice-events.jsonl" 2> "$log/practice-stderr.txt")
rm -rf "$dir"
jq -c 'map_values(.status)' "$log/practice.json"
