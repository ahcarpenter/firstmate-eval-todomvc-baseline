"""Remove what names the setup from a review packet, keeping the content a reviewer scores."""
import re
import sys

SKILLS = """api-and-interface-design browser-testing-with-devtools ci-cd-and-automation code-review-and-quality
code-simplification constraint-driven-development context-engineering debugging-and-error-recovery
deprecation-and-migration documentation-and-adrs doubt-driven-development frontend-ui-engineering
git-workflow-and-versioning idea-refine incremental-implementation interview-me observability-and-instrumentation
performance-optimization planning-and-task-breakdown security-and-hardening shipping-and-launch
source-driven-development spec-driven-development test-driven-development using-agent-skills""".split()

PATTERNS = [
    r"addyosmani/agent-skills", r"addyosmani", r"agent-skills(:[\w-]+)?", r"best[- ]practices?( pack| section| adapter)?",
    r"FM_BEST_PRACTICES\w*", r"\b0\.6\.14\b", r"\bpack\b", r"Pack read at launch", r"\bunreviewed\b",
    r"doubt[- ]cycles?", r"cross-model review", r"five[- ]axes", r"five-axis", r"CONSTRAINTS\.md",
    r"constraints file", r"Structural Remedies", r"answer[- ]by[- ]experiment",
] + [re.escape(s) for s in SKILLS]


def redact(text: str) -> str:
    text = re.sub(r"noticed but not touching", "noticed", text, flags=re.I)
    for pattern in PATTERNS:
        text = re.sub(pattern, "[redacted]", text, flags=re.I)
    return text


if __name__ == "__main__":
    sys.stdout.write(redact(sys.stdin.read()))
