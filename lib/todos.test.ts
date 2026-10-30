import { describe, expect, it } from "vitest";
import { dedupeIds, filterTodos, nextId, pluralize, type Todo } from "./todos";

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

  it("never reuses a live id after a delete", () => {
    const afterDelete: Todo[] = [
      { id: 2, title: "Walk the dog", completed: true },
      { id: 3, title: "Read", completed: false },
    ];
    expect(nextId(afterDelete)).toBe(4);
  });
});

describe("dedupeIds", () => {
  it("leaves unique ids alone", () => {
    expect(dedupeIds(todos)).toEqual(todos);
  });

  it("gives later duplicates fresh ids", () => {
    const duplicated: Todo[] = [
      { id: 2, title: "A", completed: false },
      { id: 2, title: "B", completed: false },
      { id: 1, title: "C", completed: false },
    ];
    expect(dedupeIds(duplicated).map((todo) => todo.id)).toEqual([2, 3, 1]);
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
