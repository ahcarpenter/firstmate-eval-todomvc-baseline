import { describe, expect, it } from "vitest";
import { filterTodos, formatDue, isOverdue, localDay, nextDay, nextId, pluralize, type Todo } from "./todos";

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

describe("nextDay", () => {
  it("returns the following calendar day", () => {
    expect(nextDay("2026-10-29")).toBe("2026-10-30");
  });

  it("rolls over month, year, and leap-day boundaries", () => {
    expect(nextDay("2026-10-31")).toBe("2026-11-01");
    expect(nextDay("2026-12-31")).toBe("2027-01-01");
    expect(nextDay("2028-02-28")).toBe("2028-02-29");
    expect(nextDay("2027-02-28")).toBe("2027-03-01");
  });
});

describe("formatDue", () => {
  it("formats a due date as a short month and day", () => {
    expect(formatDue("2026-11-03")).toBe("Due Nov 3");
    expect(formatDue("2027-01-31")).toBe("Due Jan 31");
  });

  it("returns null when there is no due date", () => {
    expect(formatDue(undefined)).toBeNull();
    expect(formatDue("")).toBeNull();
  });

  it("returns null for malformed or impossible dates", () => {
    expect(formatDue("Nov 3")).toBeNull();
    expect(formatDue("2026-02-31")).toBeNull();
  });
});
