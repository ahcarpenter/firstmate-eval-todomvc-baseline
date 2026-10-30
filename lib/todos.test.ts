import { describe, expect, it } from "vitest";
import { filterTodos, formatDue, isOverdue, localDay, nextId, pluralize, sortByDue, type Todo } from "./todos";

const todos: Todo[] = [
  { id: 1, title: "Buy milk", completed: false },
  { id: 2, title: "Walk the dog", completed: true },
];

describe("nextId", () => {
  it("starts at 1", () => {
    expect(nextId([])).toBe(1);
  });

  it("follows the existing todos", () => {
    expect(nextId(todos)).toBe(3);
  });
});

describe("pluralize", () => {
  it("uses the singular for one", () => {
    expect(pluralize(1, "item")).toBe("item");
  });

  it("uses the plural otherwise", () => {
    expect(pluralize(0, "item")).toBe("items");
    expect(pluralize(2, "item")).toBe("items");
  });
});

describe("filterTodos", () => {
  const today = "2026-10-29";
  const dated: Todo[] = [
    ...todos,
    { id: 3, title: "Pay rent", completed: false, due: "2026-10-28" },
    { id: 4, title: "File taxes", completed: true, due: "2026-10-01" },
  ];

  it("returns everything for all", () => {
    expect(filterTodos(todos, "all", today)).toHaveLength(2);
  });

  it("returns only active todos", () => {
    expect(filterTodos(todos, "active", today).map((todo) => todo.id)).toEqual([1]);
  });

  it("returns only completed todos", () => {
    expect(filterTodos(todos, "completed", today).map((todo) => todo.id)).toEqual([2]);
  });

  it("returns only overdue todos", () => {
    expect(filterTodos(dated, "overdue", today).map((todo) => todo.id)).toEqual([3]);
  });
});

describe("sortByDue", () => {
  const todo = (id: number, due?: string): Todo => ({ id, title: `Todo ${id}`, completed: false, due });

  it("orders by due date, earliest first", () => {
    const sorted = sortByDue([todo(1, "2026-11-03"), todo(2, "2025-12-31"), todo(3, "2026-10-29")]);
    expect(sorted.map((t) => t.id)).toEqual([2, 3, 1]);
  });

  it("puts todos without a valid due date last, keeping their order", () => {
    const sorted = sortByDue([todo(1), todo(2, "2026-11-03"), todo(3, "2026-02-31"), todo(4, ""), todo(5, "2026-10-29")]);
    expect(sorted.map((t) => t.id)).toEqual([5, 2, 1, 3, 4]);
  });

  it("keeps the usual order for todos due the same day", () => {
    const sorted = sortByDue([todo(1, "2026-11-03"), todo(2, "2026-10-29"), todo(3, "2026-11-03"), todo(4, "2026-10-29")]);
    expect(sorted.map((t) => t.id)).toEqual([2, 4, 1, 3]);
  });

  it("does not change the given list", () => {
    const list = [todo(1, "2026-11-03"), todo(2, "2026-10-29")];
    sortByDue(list);
    expect(list.map((t) => t.id)).toEqual([1, 2]);
  });
});

describe("isOverdue", () => {
  const today = "2026-10-29";
  const todo = (due: string | undefined, completed = false): Todo => ({ id: 1, title: "Pay rent", completed, due });

  it("is overdue when active and due before today", () => {
    expect(isOverdue(todo("2026-10-28"), today)).toBe(true);
    expect(isOverdue(todo("2025-12-31"), today)).toBe(true);
  });

  it("is not overdue when due today or later", () => {
    expect(isOverdue(todo("2026-10-29"), today)).toBe(false);
    expect(isOverdue(todo("2026-11-03"), today)).toBe(false);
  });

  it("is not overdue when completed", () => {
    expect(isOverdue(todo("2026-10-28", true), today)).toBe(false);
  });

  it("is not overdue without a valid due date", () => {
    expect(isOverdue(todo(undefined), today)).toBe(false);
    expect(isOverdue(todo(""), today)).toBe(false);
    expect(isOverdue(todo("2026-02-31"), today)).toBe(false);
    expect(isOverdue(todo("Oct 1"), today)).toBe(false);
  });
});

describe("localDay", () => {
  it("formats the local calendar day as YYYY-MM-DD", () => {
    expect(localDay(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
    expect(localDay(new Date(2026, 9, 29, 0, 0))).toBe("2026-10-29");
  });
});

describe("formatDue", () => {
  const today = "2026-10-29";

  it("formats a due date as a short month and day", () => {
    expect(formatDue("2026-11-03", today)).toBe("Due Nov 3");
    expect(formatDue("2027-01-31", today)).toBe("Due Jan 31");
    expect(formatDue("2026-10-28", today)).toBe("Due Oct 28");
    expect(formatDue("2026-10-31", today)).toBe("Due Oct 31");
  });

  it("says today or tomorrow for todos due soon", () => {
    expect(formatDue("2026-10-29", today)).toBe("Due today");
    expect(formatDue("2026-10-30", today)).toBe("Due tomorrow");
  });

  it("finds tomorrow across month and year ends", () => {
    expect(formatDue("2026-11-01", "2026-10-31")).toBe("Due tomorrow");
    expect(formatDue("2027-01-01", "2026-12-31")).toBe("Due tomorrow");
    expect(formatDue("2028-02-29", "2028-02-28")).toBe("Due tomorrow");
    expect(formatDue("2027-03-01", "2027-02-28")).toBe("Due tomorrow");
  });

  it("returns null when there is no due date", () => {
    expect(formatDue(undefined, today)).toBeNull();
    expect(formatDue("", today)).toBeNull();
  });

  it("returns null for malformed or impossible dates", () => {
    expect(formatDue("Nov 3", today)).toBeNull();
    expect(formatDue("2026-02-31", today)).toBeNull();
  });
});
