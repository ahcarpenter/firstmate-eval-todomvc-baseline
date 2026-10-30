import { describe, expect, it } from "vitest";
import { editTodo, filterTodos, formatDue, isOverdue, nextId, pluralize, todayKey, type Todo } from "./todos";

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
  it("shows the month and day", () => {
    expect(formatDue("2026-11-03")).toBe("Due Nov 3");
    expect(formatDue("2027-01-31")).toBe("Due Jan 31");
  });

  it("ignores values that are not dates", () => {
    expect(formatDue("")).toBeNull();
    expect(formatDue("2026-13-01")).toBeNull();
    expect(formatDue("Nov 3")).toBeNull();
  });
});

describe("todayKey", () => {
  it("uses the local calendar date", () => {
    expect(todayKey(new Date(2026, 9, 30, 23, 59))).toBe("2026-10-30");
    expect(todayKey(new Date(2027, 0, 5))).toBe("2027-01-05");
  });
});

describe("overdue", () => {
  const today = "2026-10-30";
  const dated: Todo[] = [
    { id: 1, title: "Past", completed: false, due: "2026-10-29" },
    { id: 2, title: "Today", completed: false, due: "2026-10-30" },
    { id: 3, title: "Future", completed: false, due: "2026-11-03" },
    { id: 4, title: "Done late", completed: true, due: "2026-10-01" },
    { id: 5, title: "No date", completed: false },
    { id: 6, title: "Last year", completed: false, due: "2025-12-31" },
  ];

  it("is overdue only when not completed and due before today", () => {
    expect(dated.filter((todo) => isOverdue(todo, today)).map((todo) => todo.id)).toEqual([1, 6]);
  });

  it("ignores due values that are not dates", () => {
    expect(isOverdue({ id: 7, title: "Bad", completed: false, due: "2026-13-01" }, "2027-01-01")).toBe(false);
  });

  it("filters to overdue todos", () => {
    expect(filterTodos(dated, "overdue", today).map((todo) => todo.id)).toEqual([1, 6]);
  });
});

describe("editTodo", () => {
  const todo: Todo = { id: 1, title: "Pay rent", completed: false, due: "2026-11-03" };

  it("sets the title and the new date", () => {
    expect(editTodo(todo, "Pay bills", "2026-11-10")).toEqual({ ...todo, title: "Pay bills", due: "2026-11-10" });
  });

  it("removes the date when it is cleared", () => {
    expect(editTodo(todo, "Pay rent", "")).toEqual({ id: 1, title: "Pay rent", completed: false });
  });

  it("adds a date to a todo without one", () => {
    expect(editTodo({ id: 2, title: "Buy milk", completed: false }, "Buy milk", "2026-10-29").due).toBe("2026-10-29");
  });
});
