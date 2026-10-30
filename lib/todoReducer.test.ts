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
    expect(todoReducer(todos, { type: "add", title: "  Read a book  " })).toEqual([
      ...todos,
      { id: 3, title: "Read a book", completed: false },
    ]);
  });

  it("ignores a blank new title", () => {
    expect(todoReducer(todos, { type: "add", title: "   " })).toBe(todos);
  });

  it("toggles one todo", () => {
    expect(todoReducer(todos, { type: "toggle", id: 1 }).map((todo) => todo.completed)).toEqual([true, true]);
  });

  it("pins and unpins one todo", () => {
    const pinned = todoReducer(todos, { type: "togglePin", id: 2 });
    expect(pinned.map((todo) => Boolean(todo.pinned))).toEqual([false, true]);
    expect(todoReducer(pinned, { type: "togglePin", id: 2 }).some((todo) => todo.pinned)).toBe(false);
  });

  it("marks every todo complete or active", () => {
    expect(todoReducer(todos, { type: "toggleAll", completed: true }).every((todo) => todo.completed)).toBe(true);
    expect(todoReducer(todos, { type: "toggleAll", completed: false }).some((todo) => todo.completed)).toBe(false);
  });

  it("destroys a todo", () => {
    expect(todoReducer(todos, { type: "destroy", id: 1 }).map((todo) => todo.id)).toEqual([2]);
  });

  it("saves a trimmed title", () => {
    expect(todoReducer(todos, { type: "save", id: 1, title: "  Buy oat milk " })[0].title).toBe("Buy oat milk");
  });

  it("destroys a todo saved with a blank title", () => {
    expect(todoReducer(todos, { type: "save", id: 2, title: "  " }).map((todo) => todo.id)).toEqual([1]);
  });

  it("clears completed todos", () => {
    expect(todoReducer(todos, { type: "clearCompleted" }).map((todo) => todo.id)).toEqual([1]);
  });
});
