"""The measures BAR.md's amendment adds: the long chain, the future-change probes,
maintainability, test value, the practice grade, and the reviewer calibration.

Usage: analyze2.py <runs-dir> <probes-dir> <out-dir>
Reads each run's result.json, stream-*.jsonl, grade/summary.json, maint/maint.json,
practice-mech.json, practice.json, and testvalue/testvalue.json; each probe's result,
grade, rewrite.json, and testvalue; and <out-dir>/stats.json from analyze.py.
Writes amendment.json, chain.csv, probes.csv, and two charts to <out-dir>.
"""
import csv
import json
import math
import statistics
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from analyze import holm, read_json, session_usage, sign_flip_p  # noqa: E402

CHAIN = ["due-dates", "overdue", "edit-due-date", "sort-by-due", "due-soon", "search", "reschedule-overdue"]
PAIRED = ["fix-duplicate-ids", "refactor-state", "a11y-keyboard", "completed-count", "dedupe-active",
          "undo-delete", "multiple-lists", "due-dates", "overdue"]
PRACTICES = ["reproduce_first", "assumptions_recorded", "stack_discovery", "incremental_slices", "self_review",
             "simplification_pass", "test_experiment", "docs_where_behavior_changed", "scope_kept",
             "verification_story", "hand_check"]
MECHANICAL = ["checks_before_done", "failing_test_before_fix", "hand_or_e2e_check_before_done"]
CRITERIA = ["change_size", "summary_clarity", "verification_story", "follow_ups", "decision_records", "handoff",
            "code_quality", "tests", "maintainability", "overall"]

runs_dir, probes_dir, out = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
out.mkdir(parents=True, exist_ok=True)


def load(directory):
    found = {}
    for d in sorted(p for p in directory.iterdir() if (p / "result.json").exists()) if directory.exists() else []:
        r = read_json(d / "result.json")
        found[(r["task"], r["arm"], r["rep"])] = {"dir": d, "result": r, "grade": read_json(d / "grade" / "summary.json", {}) or {},
                                                  "usage": session_usage(d)}
    return found


def quality(entry):
    """Q = h × g (BAR.md), 0 for a result that commits nothing."""
    if not entry or not entry["result"].get("committed"):
        return 0.0
    g = entry["grade"]
    h = g.get("hidden", {}).get("passed", 0) / g["hidden"]["total"] if g.get("hidden", {}).get("total") else 0.0
    r = g.get("regression", {}).get("passed", 0) / g["regression"]["total"] if g.get("regression", {}).get("total") else 0.0
    return h * r


def passed_names(entry):
    summary = entry["grade"]
    names = {"regression: " + t for t in summary.get("regression_passed_titles", [])}
    names |= {f"{entry['result']['task']}: {t}" for t in summary.get("hidden_passed_titles", [])}
    for task, block in (summary.get("prior") or {}).items():
        names |= {f"{task}: {t}" for t in block.get("passed_titles", [])}
    return names


def mean(values):
    values = [v for v in values if v is not None]
    return statistics.mean(values) if values else None


def ranks(values):
    """Average ranks, so tied scores share their mean rank."""
    order = sorted(range(len(values)), key=lambda i: values[i])
    out, i = [0.0] * len(values), 0
    while i < len(order):
        j = i
        while j + 1 < len(order) and values[order[j + 1]] == values[order[i]]:
            j += 1
        for k in range(i, j + 1):
            out[order[k]] = (i + j) / 2 + 1
        i = j + 1
    return out


def spearman(a, b):
    """Spearman's rho with ties: Pearson's correlation of the average ranks; None when either side is constant."""
    ra, rb = ranks(a), ranks(b)
    ma, mb = statistics.mean(ra), statistics.mean(rb)
    sa, sb = math.sqrt(sum((x - ma) ** 2 for x in ra)), math.sqrt(sum((y - mb) ** 2 for y in rb))
    return None if not sa or not sb else sum((x - ma) * (y - mb) for x, y in zip(ra, rb)) / (sa * sb)


def kendall_tau_b(a, b):
    """Kendall's tau-b, which corrects for ties on either side; None when either side is constant."""
    concordant = discordant = ties_a = ties_b = 0
    for i in range(len(a)):
        for j in range(i + 1, len(a)):
            da, db = a[i] - a[j], b[i] - b[j]
            if da == 0 and db == 0:
                continue
            if da == 0:
                ties_a += 1
            elif db == 0:
                ties_b += 1
            elif (da > 0) == (db > 0):
                concordant += 1
            else:
                discordant += 1
    denom = math.sqrt((concordant + discordant + ties_a) * (concordant + discordant + ties_b))
    return None if not denom else (concordant - discordant) / denom


def same_order(a, b):
    """Pairs of changes the reviewer orders the way the owner does, counting a tie as the same only when both tie."""
    return sum(1 for i in range(len(a)) for j in range(i + 1, len(a))
               if (a[i] > a[j] and b[i] > b[j]) or (a[i] < a[j] and b[i] < b[j]) or (a[i] == a[j] and b[i] == b[j]))


def summarize(diffs):
    return {"n": len(diffs), "mean": statistics.mean(diffs), "sign_flip_p": sign_flip_p(diffs),
            "positive": sum(d > 1e-12 for d in diffs), "negative": sum(d < -1e-12 for d in diffs)} if diffs else None


runs, probes = load(runs_dir), load(probes_dir)
REPS = sorted({k[2] for k in runs})
stats = {}

# The long chain: per link, arm, and repetition.
FIXTURE_REGRESSION = 19
chain_rows = []
for arm in "AB":
    for rep in REPS:
        earlier = None  # the nearest earlier link that changed anything; the fixture before the first
        for k, task in enumerate(CHAIN, 1):
            entry = runs.get((task, arm, rep))
            if not entry:
                continue
            q = quality(entry)
            if entry["result"].get("committed"):
                now = passed_names(entry)
                before = passed_names(earlier) if earlier else {"regression: " + t for t in entry["grade"].get("regression_passed_titles", [])} | {
                    "regression: " + t for t in entry["grade"].get("regression", {}).get("failed", [])}
                judged = {n for n in before if n.split(": ", 1)[0] in {"regression"} | set(CHAIN[:k - 1])}
                broken = sorted(judged - now)
                rate = len(broken) / len(judged) if judged else 0.0
                earlier = entry
            else:
                broken, rate = [], 0.0  # nothing changed, so nothing earlier broke
            u = entry["usage"]
            chain_rows.append({"arm": arm, "rep": rep, "link": k, "task": task, "committed": entry["result"].get("committed"),
                               "Q": q, "regression_rate": rate, "R": 1 - rate, "CQ": q * (1 - rate), "broken": "; ".join(broken),
                               "cost_usd": u["cost_usd"], "tokens": u["input"] + u["cache_write"] + u["cache_read"] + u["output"],
                               "output_tokens": u["output"], "wall_seconds": entry["result"].get("wall_seconds"), "turns": u["turns"]})
with open(out / "chain.csv", "w", newline="") as f:
    if chain_rows:
        writer = csv.DictWriter(f, fieldnames=list(chain_rows[0]))
        writer.writeheader()
        writer.writerows(chain_rows)

per_link = []
for k, task in enumerate(CHAIN, 1):
    cell = {arm: [r for r in chain_rows if r["link"] == k and r["arm"] == arm] for arm in "AB"}
    if not all(cell.values()):
        continue
    row = {"link": k, "task": task}
    for arm in "AB":
        for key in ("CQ", "Q", "regression_rate", "cost_usd", "tokens", "wall_seconds", "turns"):
            row[f"{key}_{arm}"] = mean([r[key] for r in cell[arm]])
    per_link.append(row)
stats["chain"] = {
    "links_complete": len(per_link), "per_link": per_link,
    "CQ": summarize([r["CQ_B"] - r["CQ_A"] for r in per_link]),
    "log_cost": summarize([math.log(r["cost_usd_B"] / r["cost_usd_A"]) for r in per_link if r["cost_usd_A"] and r["cost_usd_B"]]),
    "cumulative_cost": {arm: {rep: sum(r["cost_usd"] for r in chain_rows if r["arm"] == arm and r["rep"] == rep) for rep in REPS} for arm in "AB"},
}

# Future-change probes: Q_f, MQ, cost of ownership, rewrite fraction.
probe_rows = []
for (task, arm, rep), entry in sorted(runs.items()):
    if task not in PAIRED:
        continue
    q, cost = quality(entry), entry["usage"]["cost_usd"]
    if task == "due-dates":
        follow = runs.get(("overdue", arm, rep))
        q_f, f_cost, has_probe, rewrite = quality(follow), follow["usage"]["cost_usd"] if follow else 0.0, bool(follow), None
        h_f = g_f = None
    else:
        probe = probes.get((task, arm, rep))
        has_probe = bool(probe)
        f_cost = probe["usage"]["cost_usd"] if probe else 0.0
        rewrite = (read_json(probe["dir"] / "rewrite.json", {}) or {}).get("fraction") if probe else None
        h_f = g_f = None
        if probe and probe["result"].get("committed") and probe["grade"]:
            fu = probe["grade"].get("followup") or {}
            h_f = fu.get("passed", 0) / fu["total"] if fu.get("total") else 0.0
            # g_f: of the regression tests and the task's own hidden tests the run passed, the share still passing.
            run_passed = {"regression: " + t for t in entry["grade"].get("regression_passed_titles", [])} | {
                "own: " + t for t in entry["grade"].get("hidden_passed_titles", [])}
            probe_passed = {"regression: " + t for t in probe["grade"].get("regression_passed_titles", [])} | {
                "own: " + t for t in probe["grade"].get("hidden_passed_titles", [])}
            g_f = len(run_passed & probe_passed) / len(run_passed) if run_passed else 1.0
            q_f = h_f * g_f
        else:
            q_f = 0.0
    probe_rows.append({"task": task, "arm": arm, "rep": rep, "Q": q, "Q_f": q_f, "h_f": h_f, "g_f": g_f, "MQ": q * q_f,
                       "cost_usd": cost, "followup_cost_usd": f_cost, "C_own": cost + f_cost, "has_followup": has_probe,
                       "rewrite_fraction": rewrite})
with open(out / "probes.csv", "w", newline="") as f:
    if probe_rows:
        writer = csv.DictWriter(f, fieldnames=list(probe_rows[0]))
        writer.writeheader()
        writer.writerows(probe_rows)


def task_diffs(rows, key, log=False):
    diffs = []
    for task in PAIRED:
        a = [r[key] for r in rows if r["task"] == task and r["arm"] == "A" and r[key] is not None]
        b = [r[key] for r in rows if r["task"] == task and r["arm"] == "B" and r[key] is not None]
        if a and b:
            diffs.append(math.log(mean(b) / mean(a)) if log else mean(b) - mean(a))
    return diffs


stats["probes"] = {"MQ": summarize(task_diffs(probe_rows, "MQ")), "C_own": summarize(task_diffs(probe_rows, "C_own", log=True)),
                   "by_arm": {arm: {k: mean([r[k] for r in probe_rows if r["arm"] == arm]) for k in ("Q", "Q_f", "MQ", "C_own", "rewrite_fraction")}
                              for arm in "AB"}}
tests = {"chain_CQ": stats["chain"]["CQ"], "chain_log_cost": stats["chain"]["log_cost"],
         "MQ": stats["probes"]["MQ"], "C_own": stats["probes"]["C_own"]}
named = [k for k, v in tests.items() if v]
for key, adjusted in zip(named, holm([tests[k]["sign_flip_p"] for k in named])):
    tests[key]["holm_p"] = adjusted
stats["amendment_tests"] = tests

# Maintainability, descriptive, per arm over the paired runs.
maint = {arm: [] for arm in "AB"}
for (task, arm, rep), entry in runs.items():
    m = read_json(entry["dir"] / "maint" / "maint.json")
    if task in PAIRED and m:
        cov = m.get("changed_line_unit_coverage") or {}
        maint[arm].append({"complexity_added": m.get("complexity_added"), "duplication_added": m["duplication"]["percentage_added"],
                           "lint_warnings_added": m.get("lint_warnings_added"), "escape_hatches": m.get("escape_hatches_total"),
                           "changed_line_coverage": cov.get("fraction"), "unit_tests_added": m.get("unit_tests_added"),
                           "e2e_tests_added": m.get("e2e_tests_added"), "source_lines_added": m.get("source_lines_added")})
stats["maintainability"] = {arm: {k: mean([row[k] for row in rows]) for k in (rows[0] if rows else {})} | {"runs": len(rows)}
                            for arm, rows in maint.items()}

# Test value: flagged regressions and whether the earlier work's own tests caught them.
value = {}
for label, source in (("chain", runs), ("probes", probes)):
    for arm in "AB":
        found = [read_json(e["dir"] / "testvalue" / "testvalue.json") for k, e in source.items() if k[1] == arm]
        found = [f for f in found if f]
        flagged = [f for f in found if f["flagged"]]
        value[f"{label}_{arm}"] = {"checked": len(found), "with_flagged_regressions": len(flagged),
                                   "flagged_tests": sum(len(f["flagged"]) for f in flagged),
                                   "caught": sum(1 for f in flagged if f.get("caught"))}
stats["test_value"] = value

# Practice grade (a diagnostic): counts per practice and arm.
practice = {}
for arm in "AB":
    entries = [e for k, e in runs.items() if k[1] == arm and k[0] in PAIRED]
    judged = [read_json(e["dir"] / "practice.json") for e in entries]
    mech = [read_json(e["dir"] / "practice-mech.json") for e in entries]
    practice[arm] = {}
    for key in PRACTICES:
        statuses = [j[key]["status"] for j in judged if j and key in j]
        practice[arm][key] = {s: statuses.count(s) for s in ("applied", "partly applied", "not applied", "not applicable")}
    for key in MECHANICAL:
        statuses = [m[key]["status"] for m in mech if m and key in m]
        practice[arm]["mechanical:" + key] = {s: statuses.count(s) for s in ("applied", "partly applied", "not applied", "not applicable")}
    practice[arm]["skills_loaded_runs"] = sum(1 for m in mech if m and m.get("skills_loaded"))
stats["practice"] = practice

# Reviewer calibration: the owner's blind scores against Codex's for the same runs, for the
# original rubric, revision 1 (the rubric of record), and revision 2 (exploratory).
owner = read_json(out.parent / "calibration" / "owner-scores.json")
if owner:
    rounds = {"original": lambda n: out.parent / "calibration" / "round-1" / f"{n}.review.json",
              "revision_1": lambda n: runs_dir / n / "review.json",
              "revision_2": lambda n: runs_dir / n / "review-r2.json"}
    stats["calibration"] = {}
    for label, path in rounds.items():
        rows = [(scores, read_json(path(name))) for name, scores in owner.items()]
        rows = [(o, x) for o, x in rows if x]
        agreement = {}
        for c in CRITERIA:
            pairs = [(o[c], x[c]) for o, x in rows if isinstance(o.get(c), int) and isinstance(x.get(c), int)]
            if pairs:
                mad = statistics.mean(abs(o - x) for o, x in pairs)
                agreement[c] = {"n": len(pairs), "mean_abs_diff": mad, "within_one": sum(abs(o - x) <= 1 for o, x in pairs) / len(pairs),
                                "codex_minus_owner": statistics.mean(x - o for o, x in pairs),
                                "material": mad >= (0.75 if c == "overall" else 1.0)}
        stats["calibration"][label] = agreement
        # Exploratory (owner's word): rank agreement and score spread, per criterion.
        for c in CRITERIA:
            pairs = [(o[c], x[c]) for o, x in rows if isinstance(o.get(c), int) and isinstance(x.get(c), int)]
            if len(pairs) >= 3:
                owner_scores, codex_scores = [o for o, _ in pairs], [x for _, x in pairs]
                agreement[c].update({"spearman_rho": spearman(owner_scores, codex_scores), "kendall_tau_b": kendall_tau_b(owner_scores, codex_scores),
                                     "pairs_same_order": same_order(owner_scores, codex_scores), "pairs": len(pairs) * (len(pairs) - 1) // 2,
                                     "median_abs_diff": statistics.median(abs(o - x) for o, x in pairs),
                                     "owner_sd": statistics.pstdev(owner_scores), "owner_range": [min(owner_scores), max(owner_scores)],
                                     "codex_sd": statistics.pstdev(codex_scores), "codex_range": [min(codex_scores), max(codex_scores)]})

# Exploratory: the review comparison re-read with rubric revision 2, per criterion.
explore = {}
for c in CRITERIA:
    diffs = []
    for task in PAIRED:
        cell = {arm: [read_json(e["dir"] / "review-r2.json", {}).get(c) for k, e in runs.items() if k[0] == task and k[1] == arm] for arm in "AB"}
        cell = {arm: [v for v in vals if isinstance(v, int)] for arm, vals in cell.items()}
        if cell["A"] and cell["B"]:
            diffs.append(mean(cell["B"]) - mean(cell["A"]))
    explore[c] = summarize(diffs)
stats["exploratory_review_revision_2"] = explore

# The verdict's maintainability reading, beside the original rule.
original = read_json(out / "stats.json", {}) or {}
def significant(test, sign):
    return bool(test) and test.get("holm_p", 1) < 0.05 and (test["mean"] > 0) == (sign > 0)
q_gap = None
totals = original.get("arm_totals", {})
if totals.get("A", {}).get("mean_Q") is not None and totals.get("B", {}).get("mean_Q") is not None:
    q_gap = totals["B"]["mean_Q"] - totals["A"]["mean_Q"]
stats["maintainability_reading"] = {
    "B_significantly_worse_on_chain_CQ": significant(tests.get("chain_CQ"), -1),
    "B_significantly_worse_on_MQ": significant(tests.get("MQ"), -1),
    "B_significantly_better_on_chain_CQ": significant(tests.get("chain_CQ"), 1),
    "B_mean_Q_minus_A": q_gap,
    "MQ_agrees_with_chain": (None if not tests.get("MQ") or not tests.get("chain_CQ")
                             else (tests["MQ"]["mean"] > 0) == (tests["chain_CQ"]["mean"] > 0)),
}


def line_chart(key, label, path, fmt):
    width, height, pad = 640, 384, 56
    plot_bottom = height - pad - 24
    colors = {"A": "#2b6cb0", "B": "#c05621"}
    values = [r[key] for r in chain_rows] or [1]
    step = 0.25 if max(values) > 0.5 else 0.05
    top = math.ceil(max(values) * 1.1 / step) * step or 1
    x = lambda k: pad + (width - 2 * pad) * (k - 1) / (len(CHAIN) - 1)
    y = lambda v: plot_bottom - (plot_bottom - pad / 2) * v / top
    parts = []
    for arm in "AB":
        pts = [(r["link"], r[f"{key}_{arm}"]) for r in per_link]
        if pts:
            parts.append(f'<polyline fill="none" stroke="{colors[arm]}" stroke-width="2" points="{" ".join(f"{x(k):.1f},{y(v):.1f}" for k, v in pts)}"/>')
        for r in chain_rows:
            if r["arm"] == arm:
                parts.append(f'<circle cx="{x(r["link"]) + (-4 if arm == "A" else 4):.1f}" cy="{y(r[key]):.1f}" r="3" fill="{colors[arm]}" fill-opacity="0.45"><title>{r["task"]} {arm} r{r["rep"]}: {fmt(r[key])}</title></circle>')
    ticks = "".join(f'<text x="{x(k):.0f}" y="{plot_bottom + 16}" font-size="10" text-anchor="middle">{k}</text>' for k in range(1, len(CHAIN) + 1))
    yt = "".join(f'<text x="{pad - 6}" y="{y(top * f) + 4:.0f}" font-size="10" text-anchor="end">{fmt(top * f)}</text>' for f in (0, 0.5, 1))
    Path(path).write_text(f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" font-family="sans-serif">
<rect width="100%" height="100%" fill="#fff"/>
<line x1="{pad}" y1="{plot_bottom}" x2="{width - pad}" y2="{plot_bottom}" stroke="#555"/><line x1="{pad}" y1="{pad / 2}" x2="{pad}" y2="{plot_bottom}" stroke="#555"/>
{ticks}{yt}
<text x="{width / 2}" y="{plot_bottom + 36}" font-size="12" text-anchor="middle">Chain link (1 due dates ... 7 move overdue to today)</text>
<text x="14" y="{plot_bottom / 2 + pad / 4}" font-size="12" text-anchor="middle" transform="rotate(-90 14 {plot_bottom / 2 + pad / 4})">{label}</text>
<line x1="{width / 2 - 170}" y1="{height - 14}" x2="{width / 2 - 150}" y2="{height - 14}" stroke="{colors['A']}" stroke-width="2"/><text x="{width / 2 - 144}" y="{height - 10}" font-size="12">A, baseline</text>
<line x1="{width / 2 + 10}" y1="{height - 14}" x2="{width / 2 + 30}" y2="{height - 14}" stroke="{colors['B']}" stroke-width="2"/><text x="{width / 2 + 36}" y="{height - 10}" font-size="12">B, agent-skills adapter</text>
{''.join(parts)}
</svg>
""")


if per_link:
    line_chart("cost_usd", "Cost per feature (API-equivalent dollars)", out / "chain-cost.svg", lambda v: f"${v:.2f}")
    line_chart("regression_rate", "Earlier behavior broken (share of earlier tests)", out / "chain-regressions.svg", lambda v: f"{v:.2f}")
(out / "amendment.json").write_text(json.dumps(stats, indent=2))
print(json.dumps({k: stats[k] for k in ("amendment_tests", "maintainability_reading")}, indent=2))
