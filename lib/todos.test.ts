import { describe, expect, it } from "vitest";
import { filterTodos, formatDueDate, isOverdue, localDate, nextId, pluralize, sortByDueDate, type Todo } from "./todos";

const todos: Todo[] = [
  { id: 1, title: "Buy milk", completed: false },
  { id: 2, title: "Walk the dog", completed: true },
];

const TODAY = "2026-10-29";

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
  it("returns everything for all", () => {
    expect(filterTodos(todos, "all", TODAY)).toHaveLength(2);
  });

  it("returns only active todos", () => {
    expect(filterTodos(todos, "active", TODAY).map((todo) => todo.id)).toEqual([1]);
  });

  it("returns only completed todos", () => {
    expect(filterTodos(todos, "completed", TODAY).map((todo) => todo.id)).toEqual([2]);
  });

  it("returns only overdue todos", () => {
    const dated: Todo[] = [
      { id: 1, title: "Late", completed: false, dueDate: "2026-10-28" },
      { id: 2, title: "Today", completed: false, dueDate: TODAY },
      { id: 3, title: "Done late", completed: true, dueDate: "2026-10-01" },
      { id: 4, title: "No date", completed: false },
    ];
    expect(filterTodos(dated, "overdue", TODAY).map((todo) => todo.id)).toEqual([1]);
  });
});

describe("sortByDueDate", () => {
  const mixed: Todo[] = [
    { id: 1, title: "No date", completed: false },
    { id: 2, title: "Later", completed: false, dueDate: "2026-11-03" },
    { id: 3, title: "Earliest", completed: true, dueDate: "2026-10-01" },
    { id: 4, title: "Also no date", completed: false },
    { id: 5, title: "Later too", completed: false, dueDate: "2026-11-03" },
    { id: 6, title: "Next year", completed: false, dueDate: "2027-01-01" },
  ];

  it("puts the earliest due date first and undated todos last, keeping ties in order", () => {
    expect(sortByDueDate(mixed).map((todo) => todo.id)).toEqual([3, 2, 5, 6, 1, 4]);
  });

  it("does not change the input order", () => {
    sortByDueDate(mixed);
    expect(mixed.map((todo) => todo.id)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe("formatDueDate", () => {
  it("shows the short month and day", () => {
    expect(formatDueDate("2026-11-03", TODAY)).toBe("Due Nov 3");
  });

  it("keeps the calendar day at month edges", () => {
    expect(formatDueDate("2026-01-01", TODAY)).toBe("Due Jan 1");
    expect(formatDueDate("2026-12-31", TODAY)).toBe("Due Dec 31");
  });

  it("says today and tomorrow for those days", () => {
    expect(formatDueDate(TODAY, TODAY)).toBe("Due today");
    expect(formatDueDate("2026-10-30", TODAY)).toBe("Due tomorrow");
    expect(formatDueDate("2026-10-31", TODAY)).toBe("Due Oct 31");
    expect(formatDueDate("2026-10-28", TODAY)).toBe("Due Oct 28");
  });

  it("finds tomorrow across month and year ends", () => {
    expect(formatDueDate("2026-11-01", "2026-10-31")).toBe("Due tomorrow");
    expect(formatDueDate("2027-01-01", "2026-12-31")).toBe("Due tomorrow");
    expect(formatDueDate("2028-02-29", "2028-02-28")).toBe("Due tomorrow");
    expect(formatDueDate("2026-03-01", "2026-02-28")).toBe("Due tomorrow");
  });
});

describe("isOverdue", () => {
  it("is true for an active todo due before today", () => {
    expect(isOverdue({ id: 1, title: "a", completed: false, dueDate: "2026-10-28" }, TODAY)).toBe(true);
    expect(isOverdue({ id: 1, title: "a", completed: false, dueDate: "2025-12-31" }, TODAY)).toBe(true);
  });

  it("is false when due today or later", () => {
    expect(isOverdue({ id: 1, title: "a", completed: false, dueDate: TODAY }, TODAY)).toBe(false);
    expect(isOverdue({ id: 1, title: "a", completed: false, dueDate: "2026-11-03" }, TODAY)).toBe(false);
  });

  it("is false for completed or undated todos", () => {
    expect(isOverdue({ id: 1, title: "a", completed: true, dueDate: "2026-10-28" }, TODAY)).toBe(false);
    expect(isOverdue({ id: 1, title: "a", completed: false }, TODAY)).toBe(false);
  });
});

describe("localDate", () => {
  it("formats the local calendar date with padding", () => {
    expect(localDate(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
    expect(localDate(new Date(2026, 11, 31, 0, 0))).toBe("2026-12-31");
  });
});
