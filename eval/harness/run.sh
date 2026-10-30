#!/usr/bin/env bash
# One paired-evaluation run: <task> <arm A|B> <rep>.
# Arm A is the worker brief bin/fm-brief.sh composes without best-practices=;
# arm B is the same brief with --best-practices addyosmani/agent-skills, the
# pack's verified 0.6.14 copy loaded for the session, and the two exports the
# spawn writes. Everything else - model, effort, harness, flags, environment,
# fixture, task text, and canned answers - is identical.
# A probe (probe.sh) reuses this run with a follow-up spec, arm A's brief, the
# run's result as its base, and its own log directory and result branch.
set -euo pipefail
task=$1 arm=$2 rep=$3
. "$(dirname "$0")/env.sh"
name="$task-$arm-r$rep" id=${EVAL_ID:-$task-r$rep}
brief_arm=${EVAL_BRIEF_ARM:-$arm} branch=${EVAL_RESULT_BRANCH:-$task/rep-$rep}
log="$EVAL_LOGS/$name"
[ ! -e "$log/result.json" ] || { echo "skip: $name already ran"; exit 0; }
# A run a Claude usage limit cut off, or one a restart killed, is set aside
# unscored and re-run from scratch; exit 75 tells the driver to wait for the reset.
set_aside() { # <why>
  local dest
  dest="$(dirname "$EVAL_LOGS")/interrupted-runs/$name-$(date -u +%Y%m%dT%H%M%SZ)"
  mkdir -p "$(dirname "$dest")" && mv "$log" "$dest" && echo "$1" > "$dest/set-aside.txt"
  echo "$name: $1; logs set aside in $dest" >&2
}
cut_off() { # <stream> : did a usage limit end this segment?
  jq -n -R -e '[inputs | fromjson? | select(
      .error? == "rate_limit"
      or (.type == "result" and .is_error == true and ((.result // "") | test("hit your .*limit|usage limit|out of extra usage"; "i")))
      or (.type == "assistant" and .message.model? == "<synthetic>"
          and ([.message.content[]?.text // ""] | join(" ") | test("hit your .*limit|usage limit|out of extra usage"; "i"))))]
    | length > 0' "$1" > /dev/null 2>&1
}
[ ! -e "$log" ] || set_aside "an earlier attempt ended without a result"
mkdir -p "$log"
uid=$(openssl rand -hex 4)
run="$EVAL_RUNS/$uid" copy="$EVAL_RUNS/$uid/todomvc" home="$EVAL_RUNS/$uid/home"
mkdir -p "$home/data" "$home/state/$id.inbox/handled" "$home/config"
repo=$(arm_repo "$arm")
spec=${EVAL_SPEC:-$EVAL_DIR/tasks/$task.md}
section() { awk -v h="## $2" '$0==h{f=1;next} /^## /{f=0} f' "$1" | sed -e '/./,$!d' | sed -e :a -e '/^\n*$/{$d;N;ba' -e '}'; }

# A fresh copy holding only its base: the fixture, for the chain's second
# task this arm and repetition's own first-task result, and for a later chain
# link (an "after:" line) the result of the link it follows.
base_ref=${EVAL_BASE_REF:-$FIXTURE_COMMIT}
if grep -q '^chain: 2 of 2' "$spec"; then
  base_ref=$(git -C "$repo" rev-parse --verify -q "refs/heads/chain-r$rep") || { echo "error: chain-r$rep missing in $repo" >&2; exit 1; }
fi
after=$(sed -n 's/^after: //p' "$spec")
if [ -n "$after" ]; then
  base_ref=$(jq -er .head "$EVAL_LOGS/$after-$arm-r$rep/result.json") || { echo "error: $after-$arm-r$rep has no result" >&2; exit 1; }
fi
git init -q -b main "$copy"
git -C "$copy" fetch -q "$repo" "$base_ref"
git -C "$copy" reset -q --hard FETCH_HEAD
git -C "$copy" config user.name firstmate-eval
git -C "$copy" config user.email firstmate-eval@users.noreply.github.com
git -C "$copy" checkout -q --detach
cp -Rc "$EVAL_FIXTURE/node_modules" "$copy/node_modules"
base=$(git -C "$copy" rev-parse HEAD)

# The worker brief, composed by the firstmate commit under test.
bp=(); [ "$brief_arm" = B ] && bp=(--best-practices addyosmani/agent-skills)
(cd "$EVAL_FMROOT" && FM_HOME="$home" bash bin/fm-brief.sh "$id" todomvc --mode local-only ${bp[@]+"${bp[@]}"}) > /dev/null
brief="$home/data/$id/brief.md"
ASK=$(section "$spec" Ask) SPEC="Project: the TodoMVC app at the root of this repository (Next.js App Router, TypeScript). Deliver the change on your branch as the Definition of done says." \
  python3 -c 'import os,sys; p=sys.argv[1]; s=open(p).read(); s=s.replace("{TASK}", os.environ["ASK"]).replace("{FIRSTMATE_SPEC}", os.environ["SPEC"]); open(p,"w").write(s)' "$brief"
launch="$home/data/$id/launch-brief.md"
{ ( . "$EVAL_FMROOT/bin/fm-dod-lib.sh" && fm_brief_worker_role "$home/state" "$id" "$EVAL_FMROOT" ) && printf '\n' && cat "$brief"; } > "$launch"
doorbell=$(FM_STATE_OVERRIDE="$home/state" "$EVAL_FMROOT/bin/fm-operational-input.sh" record launch-brief < "$launch")
cp "$launch" "$log/launch-brief.md"

envs=(HOME="$HOME" USER="$USER" LOGNAME="$USER" SHELL=/bin/zsh TERM=dumb LANG=en_US.UTF-8 TMPDIR="$run/tmp/"
  PATH="$EVAL_NODE_BIN:$(dirname "$EVAL_CLAUDE")${EVAL_EXTRA_PATH:+:$EVAL_EXTRA_PATH}:/usr/bin:/bin:/usr/sbin:/sbin"
  PLAYWRIGHT_BROWSERS_PATH="$PLAYWRIGHT_BROWSERS_PATH" CHROME_DEVTOOLS_AXI_SESSION="eval-$uid"
  FM_TASK_ID="$id" FM_TASK_INBOX="$home/state/$id.inbox" COMPACT_ADVISER_DISABLE=1)
flags=(--output-format stream-json --verbose --model "$EVAL_MODEL" --effort "$EVAL_EFFORT"
  --setting-sources project,local --strict-mcp-config --dangerously-skip-permissions --max-budget-usd 25)
if [ "$brief_arm" = B ]; then
  envs+=(FM_BEST_PRACTICES=addyosmani/agent-skills FM_BEST_PRACTICES_VERSION=0.6.14)
  flags+=(--plugin-dir "$EVAL_PACK")
fi
mkdir -p "$run/tmp"

status="$home/state/$id.status"
last_state() { [ -f "$status" ] && grep -oE '^[a-z-]+' "$status" | tail -1 || echo none; }
segment() { # <n> <prompt> [session]
  local n=$1 prompt=$2 sid=${3:-}
  local resume=(); [ -z "$sid" ] || resume=(--resume "$sid")
  if [ "${EVAL_DRY_RUN:-}" = 1 ]; then
    printf '%q ' env -i "${envs[@]}" "$EVAL_CLAUDE" -p "<prompt>" "${flags[@]}" ${resume[@]+"${resume[@]}"} > "$log/dry-command-$n.txt"
    : > "$log/stream-$n.jsonl"; return 0
  fi
  (cd "$copy" && env -i "${envs[@]}" perl -e 'alarm shift; exec @ARGV' "$EVAL_RUN_TIMEOUT" \
    "$EVAL_CLAUDE" -p "$prompt" "${flags[@]}" ${resume[@]+"${resume[@]}"} < /dev/null > "$log/stream-$n.jsonl" 2> "$log/stderr-$n.txt") || true
}
steer() { # <n> <body>
  local f="$home/state/$id.inbox/$(printf '%03d' "$1").msg"
  printf 'schema=fm-task-inbox.v1\nat=%s\nbody-terminator=1\n--\n%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$2" > "$f"
}

start=$(date +%s)
segment 1 "$doorbell"
cut_off "$log/stream-1.jsonl" && { set_aside "cut off by a Claude usage limit"; exit 75; }
sid=$(jq -r 'select(.type=="system" and .subtype=="init") | .session_id' "$log/stream-1.jsonl" | head -1)
steers=0 n=1 answers=0
ring="Firstmate instruction waiting: list \"\$FM_TASK_INBOX\"/*.msg in your '$id.inbox' steering inbox, read and act on each in numeric order, then mv each into its handled/."
while [ "$steers" -lt "$EVAL_MAX_STEERS" ] && [ -n "$sid" ]; do
  state=$(last_state)
  case $state in
    done) break ;;
    needs-decision | blocked) steer $((steers + 1)) "$(section "$spec" 'Answer if asked')"; answers=$((answers + 1)) ;;
    *) steer $((steers + 1)) "Continue the task through its Definition of done, then append the done line." ;;
  esac
  steers=$((steers + 1)) n=$((n + 1))
  segment "$n" "$ring" "$sid"
  cut_off "$log/stream-$n.jsonl" && { set_aside "cut off by a Claude usage limit"; exit 75; }
done
end=$(date +%s)

cp "$status" "$log/status.txt" 2>/dev/null || : > "$log/status.txt"
head=$(git -C "$copy" rev-parse -q --verify "refs/heads/fm/$id" || true)
[ -n "$head" ] || head=$(git -C "$copy" rev-parse HEAD)
dirty=$(git -C "$copy" status --porcelain --untracked-files=normal | wc -l | tr -d ' ')
if [ "$head" != "$base" ]; then
  git -C "$repo" fetch -q "$copy" "$head:refs/heads/$branch"
fi
if grep -q '^chain: 1 of 2' "$spec"; then
  chain_head=$head; [ "$head" != "$base" ] || chain_head=$base
  git -C "$repo" update-ref "refs/heads/chain-r$rep" "$chain_head"
fi
jq -rs 'map(select(.type=="result")) | last | .result // ""' "$log"/stream-*.jsonl > "$log/final-message.md"
jq -n --arg name "$name" --arg task "$task" --arg arm "$arm" --argjson rep "$rep" --arg uid "$uid" --arg base "$base" --arg head "$head" \
  --argjson wall $((end - start)) --argjson steers "$steers" --argjson answers "$answers" --argjson dirty "$dirty" \
  --arg final_state "$(last_state)" --arg model "$EVAL_MODEL" --arg effort "$EVAL_EFFORT" \
  --arg brief_arm "$brief_arm" --arg spec "$(basename "$(dirname "$spec")")/$(basename "$spec")" --arg branch "$branch" \
  --arg started "$(date -u -r "$start" +%Y-%m-%dT%H:%M:%SZ)" \
  '{name: $name, task: $task, arm: $arm, rep: $rep, uid: $uid, base: $base, head: $head, committed: ($head != $base),
    wall_seconds: $wall, steers: $steers, answers: $answers, dirty_files: $dirty, final_state: $final_state,
    model: $model, effort: $effort, started: $started, brief_arm: $brief_arm, spec: $spec,
    branch: (if $head != $base then $branch else null end)}' > "$log/result.json"
echo "$name: $(jq -c '{committed, wall_seconds, steers, final_state}' "$log/result.json")"
