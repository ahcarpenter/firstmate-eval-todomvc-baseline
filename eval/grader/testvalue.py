"""Did the earlier work's own tests catch a regression the hidden tests flag?

Usage: testvalue.py <repo> <earlier-commit> <earlier-summary.json> <later-commit> <later-summary.json> <out-dir>
A regression is flagged when a hidden, earlier-link, or TodoMVC regression test passed
on the earlier result and fails on the later one. When any is flagged, the project's
tests as of the earlier result run on both results (own-tests.sh); they catch it when
one of them passes on the earlier result and fails on the later one.
Writes <out-dir>/testvalue.json.
"""
import json
import subprocess
import sys
from pathlib import Path

repo, early, early_summary, late, late_summary, out = sys.argv[1:7]
out = Path(out)
out.mkdir(parents=True, exist_ok=True)
here = Path(__file__).resolve().parent


def task_of(path):
    """The task the graded result belongs to, from the run's own record beside its grade."""
    return json.loads((Path(path).resolve().parent.parent / "result.json").read_text())["task"]


def passed(path):
    s = json.loads(Path(path).read_text())
    names = {"regression: " + t for t in s.get("regression_passed_titles", [])}
    names |= {f"{task_of(path)}: {t}" for t in s.get("hidden_passed_titles", [])}
    for task, block in (s.get("prior") or {}).items():
        names |= {f"{task}: {t}" for t in block.get("passed_titles", [])}
    return names


def ran(path):
    s = json.loads(Path(path).read_text())
    return {task_of(path)} | set((s.get("prior") or {}).keys())


before, after = passed(early_summary), passed(late_summary)
# Only tests the later grade also ran can be judged; a task's own tests count once.
scope = ran(late_summary) | {"regression"}
flagged = sorted(t for t in before - after if t.split(": ", 1)[0] in scope)
result = {"flagged": flagged, "caught": None, "own_failures_without_flag": None}
if flagged:
    runs = {}
    for side, commit in (("earlier", early), ("later", late)):
        subprocess.run(["bash", str(here / "own-tests.sh"), repo, commit, early, str(out / side)],
                       stdout=subprocess.DEVNULL, check=False)
        runs[side] = json.loads((out / side / "own-tests.json").read_text())
    newly_failing = sorted(set(runs["earlier"]["passed"]) & set(runs["later"]["failed"]))
    result.update({"caught": bool(newly_failing), "own_tests_newly_failing": newly_failing,
                   "own_tests_ran": len(runs["earlier"]["passed"]) + len(runs["earlier"]["failed"])})
(out / "testvalue.json").write_text(json.dumps(result, indent=1))
print(json.dumps({"flagged": len(flagged), "caught": result["caught"]}))
