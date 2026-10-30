import { describe, expect, it } from "vitest";
import { filterTodos, nextId, pinnedFirst, pluralize, type Todo } from "./todos";

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

  it("stays unique after a deletion", () => {
    expect(nextId([todos[1]])).toBe(3);
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

describe("pinnedFirst", () => {
  it("moves pinned todos to the top and keeps each group's order", () => {
    const list: Todo[] = [
      { id: 1, title: "a", completed: false },
      { id: 2, title: "b", completed: false, pinned: true },
      { id: 3, title: "c", completed: true },
      { id: 4, title: "d", completed: true, pinned: true },
    ];
    expect(pinnedFirst(list).map((todo) => todo.id)).toEqual([2, 4, 1, 3]);
  });

  it("leaves a list with no pins unchanged", () => {
    expect(pinnedFirst(todos)).toEqual(todos);
  });
});
