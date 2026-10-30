#!/usr/bin/env bash
# Run the plan: one pair at a time, the pair's two arms back to back in the
# plan's arm order. Two runs at once would share the machine's ports (the app's
# dev server and its end-to-end test server), so one arm could test the other's app.
# Usage: drive.sh <plan.tsv> [first-line] [last-line]
# EVAL_RUNNER names the script each plan line runs (default run.sh; probe.sh for probes).
# Env: EVAL_STATUS, a status file each wait for a Claude window is appended to,
# and EVAL_FM_HOME, the firstmate home whose fleet ledger hears of each append.
set -uo pipefail
plan=$1 from=${2:-1} to=${3:-100000}
here=$(cd "$(dirname "$0")" && pwd -P)
runner=${EVAL_RUNNER:-$here/run.sh}

note() { # <status line>
  [ -n "${EVAL_STATUS:-}" ] || return 0
  echo "$1" >> "$EVAL_STATUS"
  [ ! -e "${EVAL_FM_HOME:-/nonexistent}/config/fleet-ledger" ] ||
    "$EVAL_FM_HOME/bin/fm-fleet-ledger.sh" appended "$EVAL_FM_HOME/config" "$EVAL_STATUS" > /dev/null 2>&1 || true
}
claude_window() { # <quota json> <window id> <field>
  jq -r --arg id "$2" --arg f "$3" \
    '[.providers[]? | select(.provider == "claude") | .windows[]? | select(.id == $id) | .[$f]] | first // empty' <<< "$1"
}
# Wait until <reset>, announcing the wait, then a little longer for the reset to settle.
park() { # <reset iso time> <why>
  local epoch until
  epoch=$(date -j -u -f '%Y-%m-%dT%H:%M:%S' "${1%%.*}" +%s 2> /dev/null) || epoch=$(($(date +%s) + 3600))
  epoch=$((epoch + 120))
  until=$(date -u -r $(((epoch + 59) / 60 * 60)) +%Y-%m-%dT%H:%MZ)
  echo "$(date -u +%FT%TZ) $2; waiting until $until"
  note "paused [key=quota-wait] [at=$(date +%s)]: $2; the paired runs resume on their own at the reset until $until"
  while [ "$(date +%s)" -lt "$epoch" ]; do sleep 300; done
  note "resolved [key=quota-wait] [at=$(date +%s)]: the Claude window reset; paired runs resumed"
}
# Keep starting runs until Claude is out: wait out a five-hour window under
# EVAL_MIN_FIVE_HOUR percent remaining, and a used-up week, before each pair.
quota_gate() {
  local q five week
  q=$(quota-axi --provider claude --json 2> /dev/null) || { echo "quota read failed; starting the pair anyway" >&2; return 0; }
  week=$(claude_window "$q" seven_day percentRemaining) five=$(claude_window "$q" five_hour percentRemaining)
  if [ -n "$week" ] && [ "${week%.*}" -lt 1 ]; then
    park "$(claude_window "$q" seven_day resetsAt)" "the Claude week is used up"; quota_gate; return
  fi
  if [ -n "$five" ] && [ "${five%.*}" -lt "${EVAL_MIN_FIVE_HOUR:-20}" ]; then
    park "$(claude_window "$q" five_hour resetsAt)" "the Claude five-hour window is at $five% remaining"; quota_gate; return
  fi
}
# After a usage limit cut a run off: wait for the window that ran out.
after_cutoff() {
  local q week
  q=$(quota-axi --provider claude --json 2> /dev/null) || q='{}'
  week=$(claude_window "$q" seven_day percentRemaining)
  if [ -n "$week" ] && [ "${week%.*}" -lt 3 ]; then
    park "$(claude_window "$q" seven_day resetsAt)" "a Claude usage limit cut off a run (week used up); it is set aside and re-run"
  else
    park "$(claude_window "$q" five_hour resetsAt)" "a Claude usage limit cut off a run; it is set aside and re-run"
  fi
}

# Keep the machine from idle sleep while a run is under way, where caffeinate exists.
awake() { if command -v caffeinate > /dev/null; then caffeinate -i "$@"; else "$@"; fi; }

line=0
while IFS=$'\t' read -r task rep first second <&3; do
  line=$((line + 1))
  [ "$line" -ge "$from" ] && [ "$line" -le "$to" ] || continue
  cutoffs=0
  for arm in "$first" "$second"; do
    while :; do
      quota_gate
      echo "$(date -u +%FT%TZ) pair $line: $task r$rep arm $arm"
      awake "$runner" "$task" "$arm" "$rep" < /dev/null
      [ $? = 75 ] || break
      cutoffs=$((cutoffs + 1))
      if [ "$cutoffs" -ge 3 ]; then
        note "blocked [at=$(date +%s)]: a Claude usage limit cut off $task r$rep three times although each reset passed; the paired-run driver stopped at plan line $line"
        exit 1
      fi
      after_cutoff
    done
  done
done 3< "$plan"
echo "$(date -u +%FT%TZ) plan lines $from-$to finished"
