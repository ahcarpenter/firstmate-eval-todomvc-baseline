"""Turn one run's stream transcripts into the practice grade's inputs.

Usage: extract.py <run-log-dir>
Writes <run-log-dir>/practice-transcript.md, a numbered, compact summary of every step
(tool calls with their commands and outcomes, and what the worker said) for the blind
reviewer, and <run-log-dir>/practice-mech.json, the practices the tool-call order shows.
Workers mostly edit files through shell commands, so edits and check commands are read
out of each command's text; the rules are below and are the same for both arms.
"""
import os
import tempfile
import json
import re
import sys
from pathlib import Path

run = Path(sys.argv[1])
task = json.loads((run / "result.json").read_text())["task"]

WRITE = re.compile(r"open\([^)]*['\"]w['\"]|write_text\(|\bsed -i|\bperl -[a-z]*i|cat\s*>|>\s*\S*(app|components|lib|e2e)/|\btee\b|\bgit apply\b|\bpatch\b|\bmv\b|\bcp\b|\brm\b")
PROJECT_PATH = re.compile(r"(?:<repo>/|\b)((?:app|components|lib|e2e)/[\w.\[\]/()-]+\.(?:tsx?|css|mjs|json)|README\.md|[\w.-]+\.config\.[cm]?[jt]s|package\.json)")
CHECKS = {
    "lint": re.compile(r"npm run\b[\w -]*?\blint\b|\beslint\b|next lint"),
    "typecheck": re.compile(r"npm run\b[\w -]*?\btypecheck\b|\btsc\b"),
    "unit": re.compile(r"\bvitest\b|npm (run\b[\w -]*?)?\btest\b(?!:)|npm t\b"),
    "build": re.compile(r"npm run\b[\w -]*?\bbuild\b|next build"),
    "e2e": re.compile(r"test:e2e|playwright test"),
    "browser": re.compile(r"chrome-devtools-axi|curl\s+[^|;]*localhost"),
}
FAILED = re.compile(r"(\b\d+ failed\b|\bFAIL\b|error TS\d+|✘|Failed to compile|Type error|\d+ errors?\b(?! and 0)|ELIFECYCLE|Command failed)")
IS_TEST = re.compile(r"(\.test\.|\.spec\.|(^|/)e2e/)")
TARGETS = [
    re.compile(r"\bp\s*=\s*['\"]([^'\"]+)['\"]"),                       # p = "file" then open(p, "w")
    re.compile(r"open\(\s*['\"]([^'\"]+)['\"]\s*,\s*['\"]w"),
    re.compile(r"Path\(\s*['\"]([^'\"]+)['\"]\s*\)\.write_text"),
    re.compile(r"python3?\s+-\s+([^<|;&]+)<<"),                         # python3 - file... <<EOF
    re.compile(r"(?:cat|printf[^>]*|echo[^>]*)\s*>>?\s*(\S+)"),
    re.compile(r"\btee\s+(?:-a\s+)?(\S+)"),
    re.compile(r"\bsed\s+-i\s*(?:''|\"\")?\s+(?:-e\s+)?'[^']*'\s+(\S+(?:\s+\S+)*)"),
    re.compile(r"\b(?:mv|cp)\s+(?:-\w+\s+)*\S+\s+(\S+)"),
    re.compile(r"\brm\s+(?:-\w+\s+)*(\S+(?:\s+\S+)*)"),
]


def write_targets(text):
    found = set()
    for rx in TARGETS:
        for m in rx.finditer(text):
            for token in m.group(1).split():
                token = re.sub(r"^(?:<repo>/|\$W/|\$\{W\}/|\"?\$W\"?/)", "", token.strip("'\""))
                hit = PROJECT_PATH.fullmatch(token) or PROJECT_PATH.match(token)
                if hit:
                    found.add(hit.group(1))
    return sorted(found)


# Scratch paths under this root are hidden from the blind reviewer.
TMP_ROOT = re.escape(os.environ.get("EVAL_TMP_ROOT", tempfile.gettempdir()))


def normalize(text, cwd, home):
    text = text.replace(cwd, "<repo>") if cwd else text
    text = text.replace(home, "<task-home>") if home else text
    text = re.sub(TMP_ROOT + r"[^\s'\"]*/pack/agent-skills-[\d.]+", "<plugin>", text)
    return re.sub(TMP_ROOT + r"[^\s'\"]+", "<tmp>", text)


def result_text(content):
    if isinstance(content, list):
        return "\n".join(c.get("text", "") for c in content if isinstance(c, dict))
    return str(content or "")


steps, said, cwd, home = [], [], None, None
pending = {}
for seg, stream in enumerate(sorted(run.glob("stream-*.jsonl"), key=lambda p: int(p.stem.split("-")[1])), 1):
    if seg > 1:
        steps.append({"n": len(steps) + 1, "seg": seg, "tool": "steer", "text": "(firstmate sent a steer)"})
    for line in stream.read_text().splitlines():
        try:
            ev = json.loads(line)
        except ValueError:
            continue
        if ev.get("type") == "system" and ev.get("subtype") == "init" and not cwd:
            cwd = ev.get("cwd")
            home = str(Path(cwd).parent / "home") if cwd else None
        elif ev.get("type") == "assistant":
            for block in ev.get("message", {}).get("content", []):
                if block.get("type") == "text" and block.get("text", "").strip():
                    steps.append({"n": len(steps) + 1, "seg": seg, "tool": "says", "text": block["text"].strip()})
                elif block.get("type") == "tool_use":
                    inp = block.get("input", {})
                    text = inp.get("command") or inp.get("file_path") or inp.get("skill") or inp.get("prompt") or json.dumps(inp)
                    step = {"n": len(steps) + 1, "seg": seg, "tool": block["name"], "text": text,
                            "sub": bool(ev.get("parent_tool_use_id"))}
                    steps.append(step)
                    pending[block["id"]] = step
        elif ev.get("type") == "user":
            for block in ev.get("message", {}).get("content", []) if isinstance(ev.get("message", {}).get("content"), list) else []:
                if block.get("type") == "tool_result" and block.get("tool_use_id") in pending:
                    step = pending.pop(block["tool_use_id"])
                    out = result_text(block.get("content"))
                    step["error"] = bool(block.get("is_error"))
                    step["failed_output"] = bool(FAILED.search(out))
                    step["out_head"] = next((l for l in out.splitlines() if FAILED.search(l)), out.strip().splitlines()[0] if out.strip() else "")[:160]

for s in steps:
    s["text"] = normalize(s["text"], cwd, home)
    s["out_head"] = normalize(s.get("out_head", ""), cwd, home)
    if s["tool"] in ("Bash",):
        s["checks"] = [k for k, rx in CHECKS.items() if rx.search(s["text"])]
        s["writes"] = write_targets(s["text"]) if WRITE.search(s["text"]) else []
        s["done"] = bool(re.search(r"\bdone \[at=", s["text"]))
    elif s["tool"] in ("Write", "Edit", "MultiEdit", "NotebookEdit"):
        s["checks"], s["done"] = [], False
        s["writes"] = [m.group(1) for m in PROJECT_PATH.finditer(s["text"])]
    else:
        s["checks"], s["writes"], s["done"] = [], [], False
    s["bad"] = s.get("error", False) or s.get("failed_output", False)

# The practices the tool-call order shows.
done_at = max((s["n"] for s in steps if s["done"]), default=None)
end = done_at or (steps[-1]["n"] if steps else 0)
writes = [s for s in steps if s["writes"] and s["n"] <= end]
source_writes = [s for s in writes if any(not IS_TEST.search(f) and not f.endswith(".md") for f in s["writes"])]
# A documentation-only edit after the checks does not make them stale.
last_write = max((s["n"] for s in writes if any(not f.endswith(".md") for f in s["writes"])), default=0)
after = [s for s in steps if last_write <= s["n"] <= end and s["checks"]]
ran = {k: [s for s in after if k in s["checks"]] for k in ("lint", "typecheck", "unit", "build", "e2e", "browser")}
core = ("lint", "typecheck", "unit", "build")
core_passed = [k for k in core if ran[k] and not ran[k][-1]["bad"]]
first_source = min((s["n"] for s in source_writes), default=None)
before_fix = [s for s in steps if first_source and s["n"] < first_source]
failing_before = [s for s in before_fix if s["bad"] and set(s["checks"]) & {"unit", "e2e"}]
repro_before = [s for s in before_fix if set(s["checks"]) & {"unit", "e2e", "browser"} or re.search(r"\bnode -e\b|tsx -e|vitest", s["text"])]


def score(full, part):
    return "applied" if full else "partly applied" if part else "not applied"


mech = {
    "steps": len(steps), "done_step": done_at, "last_write_step": last_write or None,
    "checks_before_done": {
        "status": score(len(core_passed) == 4, bool(core_passed) or any(ran[k] for k in core)),
        "ran_after_last_edit": {k: [s["n"] for s in ran[k]] for k in ran},
        "passed_last": core_passed,
        "evidence": sorted({s["n"] for k in core for s in ran[k][-1:]}),
    },
    "failing_test_before_fix": {
        "status": "not applicable" if task != "fix-duplicate-ids" else score(bool(failing_before), bool(repro_before)),
        "evidence": [s["n"] for s in (failing_before or repro_before)][:5],
    },
    "hand_or_e2e_check_before_done": {
        "status": score(bool(ran["browser"]) or bool(ran["e2e"]), any(("browser" in s["checks"] or "e2e" in s["checks"]) for s in steps if s["n"] <= end)),
        "evidence": [s["n"] for s in ran["browser"] + ran["e2e"]][:5],
    },
    "skills_loaded": [s["text"] for s in steps if s["tool"] == "Skill"],
    "subagent_steps": sum(1 for s in steps if s.get("sub")),
    "failed_check_runs": sum(1 for s in steps if s["checks"] and s["bad"]),
}
(run / "practice-mech.json").write_text(json.dumps(mech, indent=1))

# The reviewer's view leaves out what only a pack session does (loading a skill or
# reading the pack's own files) and numbers the remaining steps afresh; the map
# turns the reviewer's step numbers back into the transcript's.
lines, shown = [], {}
for s in steps:
    if s["tool"] == "Skill" or "<plugin>" in s["text"]:
        continue
    n = len(shown) + 1
    shown[n] = s["n"]
    if s["tool"] == "says":
        lines.append(f"[{n}] says: {' '.join(s['text'].split())[:280]}")
    elif s["tool"] == "steer":
        lines.append(f"[{n}] {s['text']}")
    else:
        cmd = " ".join(s["text"].split())
        outcome = "error" if s["bad"] else "ok"
        tail = f" ({s['out_head']})" if s["bad"] and s.get("out_head") else ""
        lines.append(f"[{n}] {s['tool']}{' (sub-agent)' if s.get('sub') else ''}: {cmd[:300]}{' …' if len(cmd) > 300 else ''} => {outcome}{tail}")
(run / "practice-transcript.md").write_text("\n".join(lines) + "\n")
(run / "practice-steps-map.json").write_text(json.dumps(shown))
print(json.dumps({"run": run.name, "steps": len(steps), "transcript_chars": sum(len(l) + 1 for l in lines),
                  "checks_before_done": mech["checks_before_done"]["status"], "failing_test_before_fix": mech["failing_test_before_fix"]["status"]}))
