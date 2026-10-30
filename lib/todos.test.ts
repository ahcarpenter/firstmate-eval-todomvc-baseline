import { describe, expect, it } from "vitest";
import { filterTodos, formatDue, nextId, pluralize, type Todo } from "./todos";

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
  it("returns everything for all", () => {
    expect(filterTodos(todos, "all")).toHaveLength(2);
  });

  it("returns only active todos", () => {
    expect(filterTodos(todos, "active").map((todo) => todo.id)).toEqual([1]);
  });

  it("returns only completed todos", () => {
    expect(filterTodos(todos, "completed").map((todo) => todo.id)).toEqual([2]);
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
