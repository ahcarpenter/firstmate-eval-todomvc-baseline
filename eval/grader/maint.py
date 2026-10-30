"""Summarize maint.sh's raw outputs into maint.json. Usage: maint.py <out-dir> <head-dir>"""
import json
import re
import sys
from pathlib import Path

out, head = Path(sys.argv[1]), Path(sys.argv[2]).resolve()
SOURCE = re.compile(r"^(app|components|lib)/")
TEST = re.compile(r"(\.test\.|\.spec\.|(^|/)e2e/)")
ESCAPES = {
    "any": re.compile(r"(:\s*any\b|\bas\s+any\b|<any>|\bany\[\]|Array<any>|Record<[^>]*\bany\b)"),
    "ts-ignore": re.compile(r"@ts-ignore"),
    "ts-expect-error": re.compile(r"@ts-expect-error"),
    "ts-nocheck": re.compile(r"@ts-nocheck"),
    "eslint-disable": re.compile(r"eslint-disable"),
    "as-unknown-as": re.compile(r"\bas\s+unknown\s+as\b"),
}


def eslint(side):
    try:
        files = json.loads((out / f"eslint-{side}.json").read_text())
    except (OSError, ValueError):
        return None
    complexity = warnings = errors = 0
    for f in files:
        rel = str(Path(f["filePath"]).resolve()).split(f"/{side}/", 1)[-1]
        for m in f.get("messages", []):
            if m.get("ruleId") == "complexity":
                if SOURCE.match(rel) and not TEST.search(rel):
                    hit = re.search(r"complexity of (\d+)", m.get("message", ""))
                    complexity += int(hit.group(1)) if hit else 0
            elif m.get("severity") == 1:
                warnings += 1
            elif m.get("severity") == 2:
                errors += 1
    return {"complexity": complexity, "warnings": warnings, "errors": errors}


def duplication(side):
    try:
        stats = json.loads((out / f"jscpd-{side}" / "jscpd-report.json").read_text())["statistics"]["total"]
        return {"percentage": stats.get("percentage", 0.0), "duplicated_lines": stats.get("duplicatedLines", 0), "lines": stats.get("lines", 0)}
    except (OSError, ValueError, KeyError):
        return {"percentage": 0.0, "duplicated_lines": 0, "lines": 0}


def added_lines():
    added, path, line = {}, None, 0
    for raw in (out / "diff.patch").read_text(errors="replace").splitlines():
        if raw.startswith("+++ "):
            path = raw[6:] if raw.startswith("+++ b/") else None
        elif raw.startswith("@@"):
            line = int(re.search(r"\+(\d+)", raw).group(1))
        elif raw.startswith("+") and path:
            added.setdefault(path, []).append((line, raw[1:]))
            line += 1
    return added


def coverage(added):
    try:
        data = json.loads((out / "coverage" / "coverage-final.json").read_text())
    except (OSError, ValueError):
        return None
    total = covered = 0
    for path, lines in added.items():
        if not SOURCE.match(path) or TEST.search(path):
            continue
        entry = data.get(str(head / path))
        if entry is None:
            entry = next((v for k, v in data.items() if k.endswith("/" + path)), None)
        executable = {}
        if entry:
            for sid, loc in entry["statementMap"].items():
                ln = loc["start"]["line"]
                executable[ln] = executable.get(ln, False) or entry["s"].get(sid, 0) > 0
        for ln, _ in lines:
            if entry is None:
                continue  # a changed file no unit test loads is counted below
            if ln in executable:
                total += 1
                covered += executable[ln]
    untouched = sum(1 for p, ls in added.items() if SOURCE.match(p) and not TEST.search(p)
                    and data.get(str(head / p)) is None and not any(k.endswith("/" + p) for k in data))
    return {"changed_executable_lines": total, "covered": covered,
            "fraction": (covered / total) if total else None, "changed_files_without_unit_coverage": untouched}


added = added_lines()
escapes = {name: sum(1 for ls in added.values() for _, text in ls if pattern.search(text)) for name, pattern in ESCAPES.items()}
e2e_tests_added = sum(1 for p, ls in added.items() if TEST.search(p) and p.startswith("e2e/") for _, t in ls if re.match(r"\s*test\(", t))
unit_tests_added = sum(1 for p, ls in added.items() if TEST.search(p) and not p.startswith("e2e/") for _, t in ls if re.match(r"\s*(test|it)\(", t))
b, h = eslint("base"), eslint("head")
db, dh = duplication("base"), duplication("head")
print(json.dumps({
    "eslint": {"base": b, "head": h},
    "complexity_added": (h["complexity"] - b["complexity"]) if b and h else None,
    "lint_warnings_added": (h["warnings"] - b["warnings"]) if b and h else None,
    "duplication": {"base": db, "head": dh, "percentage_added": round(dh["percentage"] - db["percentage"], 3)},
    "escape_hatches": escapes, "escape_hatches_total": sum(escapes.values()),
    "changed_line_unit_coverage": coverage(added),
    "unit_tests_added": unit_tests_added, "e2e_tests_added": e2e_tests_added,
    "source_lines_added": sum(len(ls) for p, ls in added.items() if SOURCE.match(p) and not TEST.search(p)),
}, indent=1))
