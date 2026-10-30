# Shared locations for the evaluation harness. Source it; override with env vars.
EVAL_SCRATCH=${EVAL_SCRATCH:?set EVAL_SCRATCH to the scratch root holding the fixture, pack copy, browsers, arm repos, and run copies}
EVAL_DIR=${EVAL_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)}
EVAL_FIXTURE=${EVAL_FIXTURE:-$EVAL_SCRATCH/todomvc}
EVAL_FMROOT=${EVAL_FMROOT:?set EVAL_FMROOT to a checkout of the firstmate commit under test}
EVAL_PACK=${EVAL_PACK:-$EVAL_SCRATCH/pack/agent-skills-0.6.14}
EVAL_REPOS=${EVAL_REPOS:-$EVAL_SCRATCH/repos}
EVAL_RUNS=${EVAL_RUNS:-$EVAL_SCRATCH/runs}
EVAL_LOGS=${EVAL_LOGS:?set EVAL_LOGS to the durable per-run log directory}
EVAL_MODEL=${EVAL_MODEL:-claude-opus-5-5}
EVAL_EFFORT=${EVAL_EFFORT:-medium}
EVAL_RUN_TIMEOUT=${EVAL_RUN_TIMEOUT:-3600}
EVAL_MAX_STEERS=${EVAL_MAX_STEERS:-2}
EVAL_NODE_BIN=${EVAL_NODE_BIN:?set EVAL_NODE_BIN to the node installation bin directory}
EVAL_CLAUDE=${EVAL_CLAUDE:?set EVAL_CLAUDE to the claude binary}
PLAYWRIGHT_BROWSERS_PATH=${PLAYWRIGHT_BROWSERS_PATH:-$EVAL_SCRATCH/ms-playwright}
FIXTURE_COMMIT=$(git -C "$EVAL_FIXTURE" rev-parse main)
export EVAL_SCRATCH EVAL_DIR EVAL_FIXTURE EVAL_FMROOT EVAL_PACK EVAL_REPOS EVAL_RUNS EVAL_LOGS EVAL_MODEL EVAL_EFFORT \
  EVAL_RUN_TIMEOUT EVAL_MAX_STEERS EVAL_NODE_BIN EVAL_CLAUDE PLAYWRIGHT_BROWSERS_PATH FIXTURE_COMMIT
arm_repo() { case $1 in A) echo "$EVAL_REPOS/firstmate-eval-todomvc-baseline" ;; B) echo "$EVAL_REPOS/firstmate-eval-todomvc-agent-skills" ;; esac; }
