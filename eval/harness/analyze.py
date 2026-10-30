"""Collect every run's record and apply the comparison BAR.md fixes.

Usage: analyze.py <logs-dir> <out-dir>
Reads <logs-dir>/<task>-<arm>-r<rep>/{result.json, stream-*.jsonl, grade/summary.json, review.json}
and writes runs.csv, tasks.csv, stats.json, and cost-quality.svg to <out-dir>.
"""
import csv
import itertools
import json
import math
import re
import statistics
import subprocess
import sys
from pathlib import Path

CHECK_CMD = re.compile(r"\b(npm|npx|pnpm|yarn|tsc|eslint|vitest|playwright|next)\b")
CONVENTIONAL = re.compile(r"^(feat|fix|refactor|test|docs|chore|style|perf|build|ci|revert)(\([^)]+\))?!?: \S")


def read_json(path, default=None):
    try:
        return json.loads(Path(path).read_text())
    except (OSError, ValueError):
        return default


def session_usage(run_dir):
    """Sum Claude Code's own result records over a run's session segments."""
    total = {"cost_usd": 0.0, "input": 0, "cache_write": 0, "cache_read": 0, "output": 0, "turns": 0, "failed_checks": 0}
    commands = {}
    for stream in sorted(run_dir.glob("stream-*.jsonl")):
        for line in stream.read_text().splitlines():
            try:
                event = json.loads(line)
            except ValueError:
                continue
            if event.get("type") == "result":
                usage = event.get("usage") or {}
                total["cost_usd"] += event.get("total_cost_usd") or 0
                total["input"] += usage.get("input_tokens") or 0
                total["cache_write"] += usage.get("cache_creation_input_tokens") or 0
                total["cache_read"] += usage.get("cache_read_input_tokens") or 0
                total["output"] += usage.get("output_tokens") or 0
                total["turns"] += event.get("num_turns") or 0
            message = event.get("message")
            for block in (message.get("content") if isinstance(message, dict) else None) or []:
                if not isinstance(block, dict):
                    continue
                if block.get("type") == "tool_use" and block.get("name") == "Bash":
                    commands[block.get("id")] = (block.get("input") or {}).get("command", "")
                if block.get("type") == "tool_result" and block.get("is_error") and CHECK_CMD.search(commands.get(block.get("tool_use_id"), "")):
                    total["failed_checks"] += 1
    return total


def git(repo, *args):
    return subprocess.run(["git", "-C", str(repo), *args], capture_output=True, text=True).stdout


def change_shape(repo, base, head):
    if not repo or base == head:
        return {"files": [], "lines": 0, "tests_written": False, "conventional": None, "commits": 0}
    files = [f for f in git(repo, "diff", "--name-only", base, head).split("\n") if f]
    lines = 0
    for row in git(repo, "diff", "--numstat", base, head, "--", ".", ":(exclude)package-lock.json").split("\n"):
        parts = row.split("\t")
        if len(parts) == 3 and parts[0].isdigit():
            lines += int(parts[0]) + int(parts[1])
    subjects = [s for s in git(repo, "log", "--format=%s", f"{base}..{head}").split("\n") if s]
    return {
        "files": files,
        "lines": lines,
        "tests_written": any(re.search(r"(\.test\.|\.spec\.|/e2e/|__tests__)", f) for f in files),
        "conventional": sum(bool(CONVENTIONAL.match(s)) for s in subjects) / len(subjects) if subjects else None,
        "commits": len(subjects),
    }


def sign_flip_p(diffs):
    """Exact two-sided paired sign-flip permutation test on the mean of the differences."""
    observed = abs(statistics.mean(diffs))
    hits = sum(abs(statistics.mean(d * s for d, s in zip(diffs, signs))) >= observed - 1e-12
               for signs in itertools.product((1, -1), repeat=len(diffs)))
    return hits / 2 ** len(diffs)


def wilcoxon_p(diffs):
    """Exact two-sided Wilcoxon signed-rank test (zeros dropped, average ranks for ties)."""
    nonzero = [d for d in diffs if abs(d) > 1e-12]
    n = len(nonzero)
    if n == 0:
        return 1.0
    order = sorted(range(n), key=lambda i: abs(nonzero[i]))
    ranks = [0.0] * n
    i = 0
    while i < n:
        j = i
        while j + 1 < n and abs(abs(nonzero[order[j + 1]]) - abs(nonzero[order[i]])) < 1e-12:
            j += 1
        for k in range(i, j + 1):
            ranks[order[k]] = (i + j) / 2 + 1
        i = j + 1
    w_plus = sum(r for r, d in zip(ranks, nonzero) if d > 0)
    centre = sum(ranks) / 2
    extreme = sum(abs(sum(r for r, s in zip(ranks, signs) if s > 0) - centre) >= abs(w_plus - centre) - 1e-12
                  for signs in itertools.product((1, -1), repeat=n))
    return extreme / 2 ** n


def holm(pvalues):
    order = sorted(range(len(pvalues)), key=lambda i: pvalues[i])
    adjusted, running = [0.0] * len(pvalues), 0.0
    for rank, i in enumerate(order):
        running = max(running, min(1.0, (len(pvalues) - rank) * pvalues[i]))
        adjusted[i] = running
    return adjusted


def jaccard_mean(sets):
    pairs = list(itertools.combinations(sets, 2))
    if not pairs:
        return None
    return statistics.mean(len(a & b) / len(a | b) if a | b else 1.0 for a, b in pairs)


def svg_chart(rows, path):
    width, height, pad = 640, 400, 50
    costs = [r["cost_usd"] for r in rows] or [1]
    top = math.ceil(max(costs) * 1.1 / 0.25) * 0.25 or 1
    colors = {"A": "#2b6cb0", "B": "#c05621"}
    dots = []
    for r in rows:
        x = pad + (width - 2 * pad) * r["cost_usd"] / top
        y = height - pad - (height - 2 * pad) * r["Q"]
        shape = "circle" if r["arm"] == "A" else "rect"
        if shape == "circle":
            dots.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="5" fill="{colors["A"]}" fill-opacity="0.7"><title>{r["name"]}</title></circle>')
        else:
            dots.append(f'<rect x="{x - 4.5:.1f}" y="{y - 4.5:.1f}" width="9" height="9" fill="{colors["B"]}" fill-opacity="0.7"><title>{r["name"]}</title></rect>')
    step = 0.5 if top >= 1 else 0.25
    ticks = "".join(f'<text x="{pad + (width - 2 * pad) * (i * step) / top:.0f}" y="{height - pad + 18}" font-size="11" text-anchor="middle">${i * step:.2f}</text>' for i in range(int(round(top / step)) + 1))
    yticks = "".join(f'<text x="{pad - 8}" y="{height - pad - (height - 2 * pad) * q + 4:.0f}" font-size="11" text-anchor="end">{q:.2f}</text>' for q in (0, 0.25, 0.5, 0.75, 1))
    Path(path).write_text(f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" font-family="sans-serif">
<rect width="100%" height="100%" fill="#fff"/>
<line x1="{pad}" y1="{height - pad}" x2="{width - pad}" y2="{height - pad}" stroke="#555"/>
<line x1="{pad}" y1="{pad}" x2="{pad}" y2="{height - pad}" stroke="#555"/>
{ticks}{yticks}
<text x="{width / 2}" y="{height - 10}" font-size="12" text-anchor="middle">Cost per run (API-equivalent dollars, Claude Code's own record)</text>
<text x="14" y="{height / 2}" font-size="12" text-anchor="middle" transform="rotate(-90 14 {height / 2})">Quality Q = hidden × regression pass fraction</text>
<circle cx="{width - 200}" cy="{height - pad - 44}" r="5" fill="{colors['A']}"/><text x="{width - 190}" y="{height - pad - 40}" font-size="12">A, baseline</text>
<rect x="{width - 204.5}" y="{height - pad - 28.5}" width="9" height="9" fill="{colors['B']}"/><text x="{width - 190}" y="{height - pad - 20}" font-size="12">B, agent-skills adapter</text>
{''.join(dots)}
</svg>
""")


def main():
    logs, out = Path(sys.argv[1]), Path(sys.argv[2])
    repos = {"A": Path(sys.argv[3]) if len(sys.argv) > 3 else None, "B": Path(sys.argv[4]) if len(sys.argv) > 4 else None}
    out.mkdir(parents=True, exist_ok=True)
    rows = []
    for run_dir in sorted(p for p in logs.iterdir() if (p / "result.json").exists()):
        result = read_json(run_dir / "result.json", {})
        grade = read_json(run_dir / "grade" / "summary.json", {}) or {}
        review = read_json(run_dir / "review.json", {}) or {}
        usage = session_usage(run_dir)
        hidden, regression, edge = grade.get("hidden", {}), grade.get("regression", {}), grade.get("edge", {})
        h = hidden.get("passed", 0) / hidden["total"] if hidden.get("total") else 0.0
        g = regression.get("passed", 0) / regression["total"] if regression.get("total") else 0.0
        checks = grade.get("checks", {})
        committed = bool(result.get("committed"))
        q = h * g if committed else 0.0
        shape = change_shape(repos.get(result["arm"]), result["base"], result["head"])
        rows.append({
            "name": result["name"], "task": result["task"], "arm": result["arm"], "rep": result["rep"],
            "committed": committed, "final_state": result.get("final_state"), "steers": result.get("steers", 0),
            "answers": result.get("answers", 0), "wall_seconds": result.get("wall_seconds"),
            "h": round(h, 4), "g": round(g, 4), "Q": round(q, 4),
            "regression_failures": (regression.get("total", 0) - regression.get("passed", 0)) if committed else None,
            "edge": f'{edge.get("passed", 0)}/{edge.get("total", 0)}',
            "own_checks_pass": all(checks.get(k) == "pass" for k in ("lint", "typecheck", "unit", "build")) if checks else False,
            "success": committed and h == 1 and g == 1 and result.get("final_state") == "done"
                       and all(checks.get(k) == "pass" for k in ("lint", "typecheck", "unit", "build")),
            "unit_tests": grade.get("unit_tests"),
            **{k: usage[k] for k in ("cost_usd", "input", "cache_write", "cache_read", "output", "turns", "failed_checks")},
            "review_overall": review.get("overall"),
            "review_mean": round(statistics.mean(review[k] for k in ("change_size", "summary_clarity", "verification_story", "follow_ups", "decision_records", "handoff", "code_quality", "tests")), 3) if review.get("overall") else None,
            "review_handoff": review.get("handoff"),
            "files_touched": len(shape["files"]), "lines_changed": shape["lines"], "tests_written": shape["tests_written"],
            "conventional": shape["conventional"], "commits": shape["commits"], "_files": set(shape["files"]),
        })
    fields = [k for k in rows[0] if not k.startswith("_")] if rows else []
    with open(out / "runs.csv", "w", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)

    tasks = sorted({r["task"] for r in rows})
    per_task, diffs = [], {"Q": [], "review_overall": [], "regression_failures": [], "log_cost": []}
    complete = 0
    for task in tasks:
        arm_rows = {arm: [r for r in rows if r["task"] == task and r["arm"] == arm] for arm in "AB"}
        if all(len(arm_rows[a]) >= 2 for a in "AB"):
            complete += 1
        entry = {"task": task}
        for arm in "AB":
            rs = arm_rows[arm]
            mean = lambda key: statistics.mean(r[key] for r in rs if r[key] is not None) if any(r[key] is not None for r in rs) else None
            entry.update({
                f"{arm}_runs": len(rs), f"{arm}_Q": mean("Q"), f"{arm}_success": sum(r["success"] for r in rs),
                f"{arm}_cost": mean("cost_usd"), f"{arm}_wall": mean("wall_seconds"), f"{arm}_turns": mean("turns"),
                f"{arm}_steers": mean("steers"), f"{arm}_failed_checks": mean("failed_checks"),
                f"{arm}_regression_failures": mean("regression_failures"), f"{arm}_review": mean("review_overall"),
                f"{arm}_files_jaccard": jaccard_mean([r["_files"] for r in rs]),
                f"{arm}_lines_cv": (statistics.pstdev([r["lines_changed"] for r in rs]) / statistics.mean([r["lines_changed"] for r in rs])) if rs and statistics.mean([r["lines_changed"] for r in rs]) else None,
                f"{arm}_tests_written": sum(r["tests_written"] for r in rs),
                f"{arm}_conventional": mean("conventional"),
            })
        per_task.append(entry)
        if entry["A_runs"] and entry["B_runs"]:
            diffs["Q"].append(entry["B_Q"] - entry["A_Q"])
            if entry["A_review"] is not None and entry["B_review"] is not None:
                diffs["review_overall"].append(entry["B_review"] - entry["A_review"])
            if entry["A_regression_failures"] is not None and entry["B_regression_failures"] is not None:
                # Fewer failures is better, so the sign is flipped to read "B better" as positive.
                diffs["regression_failures"].append(entry["A_regression_failures"] - entry["B_regression_failures"])
            if entry["A_cost"] and entry["B_cost"]:
                diffs["log_cost"].append(math.log(entry["B_cost"] / entry["A_cost"]))
    with open(out / "tasks.csv", "w", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(per_task[0]) if per_task else [])
        writer.writeheader()
        writer.writerows(per_task)

    def summarize(values):
        if not values:
            return None
        return {"n": len(values), "mean": statistics.mean(values), "sign_flip_p": sign_flip_p(values), "wilcoxon_p": wilcoxon_p(values),
                "positive": sum(v > 1e-12 for v in values), "negative": sum(v < -1e-12 for v in values)}

    stats = {"tasks_complete": complete, "primary_Q": summarize(diffs["Q"]),
             "secondary": {k: summarize(diffs[k]) for k in ("review_overall", "regression_failures", "log_cost")}}
    named = [k for k, v in stats["secondary"].items() if v]
    for key, adjusted in zip(named, holm([stats["secondary"][k]["sign_flip_p"] for k in named])):
        stats["secondary"][key]["holm_p"] = adjusted
    stats["arm_totals"] = {arm: {"runs": sum(r["arm"] == arm for r in rows),
                                 "success": sum(r["success"] for r in rows if r["arm"] == arm),
                                 "mean_Q": statistics.mean([r["Q"] for r in rows if r["arm"] == arm]) if any(r["arm"] == arm for r in rows) else None,
                                 "cost_usd": sum(r["cost_usd"] for r in rows if r["arm"] == arm),
                                 "tokens": sum(r["input"] + r["cache_write"] + r["cache_read"] + r["output"] for r in rows if r["arm"] == arm),
                                 "wall_seconds": sum(r["wall_seconds"] or 0 for r in rows if r["arm"] == arm)} for arm in "AB"}
    (out / "stats.json").write_text(json.dumps(stats, indent=2))
    svg_chart(rows, out / "cost-quality.svg")
    print(json.dumps(stats, indent=2))


if __name__ == "__main__":
    main()
