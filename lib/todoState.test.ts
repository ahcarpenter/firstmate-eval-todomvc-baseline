import { describe, expect, it } from "vitest";
import { countActive, todosReducer } from "./todoState";
import type { Todo } from "./todos";

const todos: Todo[] = [
  { id: 1, title: "Buy milk", completed: false },
  { id: 2, title: "Walk the dog", completed: true },
];

describe("todosReducer", () => {
  it("replaces the list on load", () => {
    expect(todosReducer([], { type: "load", todos })).toBe(todos);
  });

  it("adds a trimmed, active todo", () => {
    expect(todosReducer(todos, { type: "add", title: "  Read  " })).toEqual([
      ...todos,
      { id: 3, title: "Read", completed: false },
    ]);
  });

  it("ignores a blank title on add", () => {
    expect(todosReducer(todos, { type: "add", title: "   " })).toBe(todos);
  });

  it("toggles one todo", () => {
    const next = todosReducer(todos, { type: "toggle", id: 1 });
    expect(next.map((todo) => todo.completed)).toEqual([true, true]);
  });

  it("marks every todo", () => {
    expect(todosReducer(todos, { type: "toggleAll", completed: true }).every((todo) => todo.completed)).toBe(true);
    expect(todosReducer(todos, { type: "toggleAll", completed: false }).some((todo) => todo.completed)).toBe(false);
  });

  it("destroys a todo", () => {
    expect(todosReducer(todos, { type: "destroy", id: 1 }).map((todo) => todo.id)).toEqual([2]);
  });

  it("saves a trimmed title", () => {
    expect(todosReducer(todos, { type: "save", id: 1, title: " Buy oat milk " })[0].title).toBe("Buy oat milk");
  });

  it("destroys a todo saved with a blank title", () => {
    expect(todosReducer(todos, { type: "save", id: 2, title: "  " }).map((todo) => todo.id)).toEqual([1]);
  });

  it("clears completed todos", () => {
    expect(todosReducer(todos, { type: "clearCompleted" }).map((todo) => todo.id)).toEqual([1]);
  });
});

describe("countActive", () => {
  it("counts todos that are not completed", () => {
    expect(countActive(todos)).toBe(1);
    expect(countActive([])).toBe(0);
  });
});
