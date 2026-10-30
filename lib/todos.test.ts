import { describe, expect, it } from "vitest";
import { dedupeIds, duplicateTodo, filterTodos, nextId, pluralize, type Todo } from "./todos";

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

  it("does not reuse a live id after a delete", () => {
    const afterDelete = [todos[1]];
    expect(nextId(afterDelete)).toBe(3);
  });
});

describe("dedupeIds", () => {
  it("leaves unique ids alone", () => {
    expect(dedupeIds(todos)).toEqual(todos);
  });

  it("gives repeated ids fresh unique values", () => {
    const duplicated: Todo[] = [
      { id: 2, title: "Walk the dog", completed: true },
      { id: 2, title: "Buy milk", completed: false },
    ];
    expect(dedupeIds(duplicated).map((todo) => todo.id)).toEqual([2, 3]);
  });
});

describe("duplicateTodo", () => {
  it("inserts an active copy right after the original with a fresh id", () => {
    expect(duplicateTodo(todos, 2)).toEqual([
      todos[0],
      todos[1],
      { id: 3, title: "Walk the dog", completed: false },
    ]);
    expect(duplicateTodo(todos, 1)).toEqual([
      todos[0],
      { id: 3, title: "Buy milk", completed: false },
      todos[1],
    ]);
  });

  it("leaves the list alone for an unknown id", () => {
    expect(duplicateTodo(todos, 99)).toBe(todos);
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
