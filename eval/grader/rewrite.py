"""Rewrite fraction: of the lines a run added, the share its follow-up deleted or changed.

Usage: rewrite.py <repo> <base> <run-head> <probe-head>
Counts lines outside package-lock.json. A run line counts as rewritten when the
follow-up's diff removes it (a changed line is a removal plus an addition).
"""
import json
import re
import subprocess
import sys

repo, base, head, probe = sys.argv[1:5]
git = lambda *a: subprocess.run(["git", "-C", repo, *a], capture_output=True, text=True, check=True).stdout
run_commits = set(git("rev-list", f"{base}..{head}").split())
added = sum(int(a) for a, _, path in (l.split("\t") for l in git("diff", "--numstat", base, head).splitlines())
            if a != "-" and path != "package-lock.json")
rewritten, path, removed = 0, None, {}
for line in git("diff", "-U0", head, probe, "--", ".", ":(exclude)package-lock.json").splitlines():
    if line.startswith("--- "):
        path = line[6:] if line.startswith("--- a/") else None
    elif line.startswith("@@") and path:
        m = re.match(r"@@ -(\d+)(?:,(\d+))?", line)
        start, count = int(m.group(1)), int(m.group(2) if m.group(2) is not None else 1)
        removed.setdefault(path, []).extend(range(start, start + count))
for path, lines in removed.items():
    blame = git("blame", "-l", "-s", head, "--", path).splitlines()
    rewritten += sum(1 for n in lines if 0 < n <= len(blame) and blame[n - 1].lstrip("^").split()[0] in run_commits)
print(json.dumps({"run_lines_added": added, "rewritten": rewritten, "fraction": rewritten / added if added else None}))
