import { describe, expect, it } from "vitest";
import { filterTodos, nextId, pluralize, removeTodos, restoreTodos, type Todo } from "./todos";

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

  it("follows the highest id after a delete", () => {
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

describe("removeTodos and restoreTodos", () => {
  const three: Todo[] = [...todos, { id: 3, title: "Pay rent", completed: true }];

  it("removes matching todos and records where they were", () => {
    const { kept, removed } = removeTodos(three, (todo) => todo.completed);
    expect(kept.map((todo) => todo.id)).toEqual([1]);
    expect(removed.map(({ todo, index }) => [todo.id, index])).toEqual([
      [2, 1],
      [3, 2],
    ]);
  });

  it("puts removed todos back in their original places", () => {
    const { kept, removed } = removeTodos(three, (todo) => todo.id !== 2);
    expect(restoreTodos(kept, removed)).toEqual(three);
  });

  it("restores cleared completed todos in place and still completed", () => {
    const { kept, removed } = removeTodos(three, (todo) => todo.completed);
    expect(restoreTodos(kept, removed)).toEqual(three);
  });

  it("restores after todos added since the delete were appended", () => {
    const { kept, removed } = removeTodos(three, (todo) => todo.id === 3);
    const added = [...kept, { id: 4, title: "Call mom", completed: false }];
    expect(restoreTodos(added, removed).map((todo) => todo.id)).toEqual([1, 2, 3, 4]);
  });

  it("appends when the original place no longer exists", () => {
    const { removed } = removeTodos(three, (todo) => todo.id === 3);
    expect(restoreTodos([], removed).map((todo) => todo.id)).toEqual([3]);
  });
});
