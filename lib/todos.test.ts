import { describe, expect, it } from "vitest";
import { filterTodos, findActiveDuplicate, nextId, pluralize, type Todo } from "./todos";

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

describe("findActiveDuplicate", () => {
  it("finds an active todo with the same title", () => {
    expect(findActiveDuplicate(todos, "Buy milk")?.id).toBe(1);
  });

  it("ignores case and extra whitespace", () => {
    expect(findActiveDuplicate(todos, "  buy   MILK ")?.id).toBe(1);
  });

  it("ignores completed todos", () => {
    expect(findActiveDuplicate(todos, "Walk the dog")).toBeUndefined();
  });

  it("returns nothing for a new title", () => {
    expect(findActiveDuplicate(todos, "Buy bread")).toBeUndefined();
  });

  it("skips the todo being renamed", () => {
    expect(findActiveDuplicate(todos, "BUY MILK", 1)).toBeUndefined();
  });
});
