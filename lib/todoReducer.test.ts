import { describe, expect, it } from "vitest";
import { todoReducer } from "./todoReducer";
import type { Todo } from "./todos";

const todos: Todo[] = [
  { id: 1, title: "Buy milk", completed: false },
  { id: 2, title: "Walk the dog", completed: true },
];

describe("todoReducer", () => {
  it("replaces the list on load", () => {
    expect(todoReducer([], { type: "load", todos })).toBe(todos);
  });

  it("adds a trimmed, active todo with the next id", () => {
    expect(todoReducer(todos, { type: "add", title: "  Read  " })).toEqual([
      ...todos,
      { id: 3, title: "Read", completed: false },
    ]);
  });

  it("ignores a blank new title", () => {
    expect(todoReducer(todos, { type: "add", title: "   " })).toBe(todos);
  });

  it("toggles one todo", () => {
    expect(todoReducer(todos, { type: "toggle", id: 1 }).map((todo) => todo.completed)).toEqual([true, true]);
  });

  it("sets every todo with toggleAll", () => {
    expect(todoReducer(todos, { type: "toggleAll", completed: false }).map((todo) => todo.completed)).toEqual([
      false,
      false,
    ]);
    expect(todoReducer(todos, { type: "toggleAll", completed: true }).map((todo) => todo.completed)).toEqual([
      true,
      true,
    ]);
  });

  it("destroys a todo", () => {
    expect(todoReducer(todos, { type: "destroy", id: 1 }).map((todo) => todo.id)).toEqual([2]);
  });

  it("saves a trimmed title", () => {
    expect(todoReducer(todos, { type: "save", id: 1, title: " Buy oat milk " })[0]).toEqual({
      id: 1,
      title: "Buy oat milk",
      completed: false,
    });
  });

  it("destroys a todo saved with a blank title", () => {
    expect(todoReducer(todos, { type: "save", id: 2, title: "  " }).map((todo) => todo.id)).toEqual([1]);
  });

  it("clears completed todos", () => {
    expect(todoReducer(todos, { type: "clearCompleted" }).map((todo) => todo.id)).toEqual([1]);
  });

  it("does not mutate the input list", () => {
    const before = structuredClone(todos);
    todoReducer(todos, { type: "toggle", id: 1 });
    todoReducer(todos, { type: "save", id: 1, title: "x" });
    expect(todos).toEqual(before);
  });
});
