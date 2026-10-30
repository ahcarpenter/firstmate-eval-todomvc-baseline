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

  it("does not reuse an id after a todo is deleted", () => {
    const afterDelete = todos.filter((todo) => todo.id !== 1);
    expect(nextId(afterDelete)).toBe(3);
  });
});

describe("dedupeIds", () => {
  it("leaves distinct ids alone", () => {
    expect(dedupeIds(todos)).toEqual(todos);
  });

  it("renumbers repeated ids so every todo is distinct", () => {
    const repaired = dedupeIds([
      { id: 2, title: "Walk the dog", completed: false },
      { id: 2, title: "Buy milk", completed: false },
    ]);
    expect(repaired.map((todo) => todo.id)).toEqual([2, 3]);
    expect(repaired.map((todo) => todo.title)).toEqual(["Walk the dog", "Buy milk"]);
  });
});

describe("duplicateTodo", () => {
  it("inserts an active copy with a new id right after the original", () => {
    const duplicated = duplicateTodo([...todos, { id: 3, title: "Pay rent", completed: false }], 2);
    expect(duplicated).toEqual([
      { id: 1, title: "Buy milk", completed: false },
      { id: 2, title: "Walk the dog", completed: true },
      { id: 4, title: "Walk the dog", completed: false },
      { id: 3, title: "Pay rent", completed: false },
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
