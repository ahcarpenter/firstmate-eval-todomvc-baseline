"""Write a run order.

plan.py [reps]            the paired runs: every (task, repetition) pair in a seeded
                          random order, each chain's first task before its second, and a
                          random arm order inside each pair. The two arms of a pair run back
                          to back, so time of day, cache, and rate limits fall on both arms
                          alike, and the arm that goes first is a coin flip.
plan.py --chain [reps]    the chain's later links, one link at a time in chain order; inside
                          a link, the repetitions in random order and each pair's arms in
                          random order.
plan.py --probes [reps]   one future-change probe per run of each task with a follow-up, in
                          the same pair-by-pair random order."""
import random
import sys

TASKS = ["fix-duplicate-ids", "refactor-state", "a11y-keyboard", "completed-count", "dedupe-active",
         "undo-delete", "multiple-lists", "due-dates", "overdue"]
CHAIN = ["edit-due-date", "sort-by-due", "due-soon", "search", "reschedule-overdue"]
PROBED = [t for t in TASKS if t != "due-dates"]
args = sys.argv[1:]
mode = args.pop(0) if args and args[0].startswith("--") else "--runs"
REPS = int(args[0]) if args else 3
SEEDS = {"--runs": 20261029, "--probes": 20261030, "--chain": 20261031}
rng = random.Random(SEEDS[mode])


def emit(pairs):
    for task, rep in pairs:
        arms = ["A", "B"]
        rng.shuffle(arms)
        print(f"{task}\t{rep}\t{arms[0]}\t{arms[1]}")


if mode == "--chain":
    for task in CHAIN:
        reps = list(range(1, REPS + 1))
        rng.shuffle(reps)
        emit([(task, rep) for rep in reps])
else:
    pairs = [(task, rep) for task in (TASKS if mode == "--runs" else PROBED) for rep in range(1, REPS + 1)]
    rng.shuffle(pairs)
    if mode == "--runs":
        # Keep each chain's second task after its first, moving it to just after if needed.
        for rep in range(1, REPS + 1):
            first, second = pairs.index(("due-dates", rep)), pairs.index(("overdue", rep))
            if second < first:
                pairs.insert(first, pairs.pop(second))
    emit(pairs)
