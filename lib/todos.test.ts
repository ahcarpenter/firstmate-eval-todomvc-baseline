import { describe, expect, it } from "vitest";
import { filterTodos, formatDueDate, isOverdue, localDate, nextDay, nextId, pluralize, type Todo } from "./todos";

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

describe("formatDueDate", () => {
  it("shows the short month and day", () => {
    expect(formatDueDate("2026-11-03")).toBe("Due Nov 3");
  });

  it("keeps the calendar day at month edges", () => {
    expect(formatDueDate("2026-01-01")).toBe("Due Jan 1");
    expect(formatDueDate("2026-12-31")).toBe("Due Dec 31");
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

describe("nextDay", () => {
  it("moves to the following day", () => {
    expect(nextDay("2026-10-29")).toBe("2026-10-30");
  });

  it("rolls over month and year ends", () => {
    expect(nextDay("2026-10-31")).toBe("2026-11-01");
    expect(nextDay("2026-12-31")).toBe("2027-01-01");
  });

  it("handles leap years", () => {
    expect(nextDay("2028-02-28")).toBe("2028-02-29");
    expect(nextDay("2026-02-28")).toBe("2026-03-01");
  });
});
