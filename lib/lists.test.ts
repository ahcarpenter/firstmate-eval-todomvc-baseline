import { describe, expect, it } from "vitest";
import { addList, nextListId, parseLists, removeList, renameList, replaceTodos, type TodoList } from "./lists";

const lists: TodoList[] = [
  { id: "1", name: "Todos", todos: [{ id: 1, title: "Buy milk", completed: false }] },
  { id: "3", name: "Work", todos: [] },
];

describe("parseLists", () => {
  it("keeps saved lists", () => {
    expect(parseLists(JSON.stringify(lists), null)).toEqual(lists);
  });

  it("moves todos saved before lists existed into a list called Todos", () => {
    const legacy = [{ id: 1, title: "Walk the dog", completed: true }];
    expect(parseLists(null, JSON.stringify(legacy))).toEqual([{ id: "1", name: "Todos", todos: legacy }]);
  });

  it("starts with an empty Todos list", () => {
    expect(parseLists(null, null)).toEqual([{ id: "1", name: "Todos", todos: [] }]);
  });

  it("ignores old todos once lists are saved", () => {
    const legacy = [{ id: 1, title: "Walk the dog", completed: true }];
    expect(parseLists(JSON.stringify(lists), JSON.stringify(legacy))).toEqual(lists);
  });
});

describe("nextListId", () => {
  it("follows the highest id", () => {
    expect(nextListId(lists)).toBe("4");
  });
});

describe("addList", () => {
  it("appends an empty list and returns it", () => {
    const [next, created] = addList(lists, "Home");
    expect(created).toEqual({ id: "4", name: "Home", todos: [] });
    expect(next).toEqual([...lists, created]);
  });
});

describe("renameList", () => {
  it("renames only the named list and keeps its todos", () => {
    const next = renameList(lists, "1", "Errands");
    expect(next[0]).toEqual({ ...lists[0], name: "Errands" });
    expect(next[1]).toBe(lists[1]);
  });
});

describe("removeList", () => {
  it("removes the named list and its todos", () => {
    expect(removeList(lists, "1")).toEqual([lists[1]]);
  });

  it("keeps the last list", () => {
    const only = [lists[0]];
    expect(removeList(only, "1")).toBe(only);
  });
});

describe("replaceTodos", () => {
  it("changes only the named list", () => {
    const todos = [{ id: 1, title: "Ship it", completed: false }];
    const next = replaceTodos(lists, "3", todos);
    expect(next[0]).toBe(lists[0]);
    expect(next[1].todos).toEqual(todos);
  });
});
