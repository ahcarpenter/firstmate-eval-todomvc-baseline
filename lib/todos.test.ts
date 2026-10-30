import { describe, expect, it } from "vitest";
import {
  LEGACY_STORAGE_KEY,
  STORAGE_KEY,
  deleteList,
  filterTodos,
  listPath,
  nextId,
  pluralize,
  readLists,
  renameList,
  type Todo,
  type TodoList,
} from "./todos";

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

  it("does not reuse an id after a deletion", () => {
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

describe("listPath", () => {
  it("leaves the filter out for all", () => {
    expect(listPath(2)).toBe("/lists/2");
  });

  it("appends other filters", () => {
    expect(listPath(2, "active")).toBe("/lists/2/active");
    expect(listPath(2, "completed")).toBe("/lists/2/completed");
  });
});

describe("readLists", () => {
  const storage = (items: Record<string, string>) => ({ getItem: (key: string) => items[key] ?? null });

  it("returns the stored lists", () => {
    const lists: TodoList[] = [{ id: 4, name: "Work", todos }];
    expect(readLists(storage({ [STORAGE_KEY]: JSON.stringify(lists) }))).toEqual(lists);
  });

  it("turns todos saved before lists into a list called Todos", () => {
    expect(readLists(storage({ [LEGACY_STORAGE_KEY]: JSON.stringify(todos) }))).toEqual([
      { id: 1, name: "Todos", todos },
    ]);
  });

  it("prefers the stored lists over the legacy todos", () => {
    const lists: TodoList[] = [{ id: 1, name: "Todos", todos: [] }];
    const items = { [STORAGE_KEY]: JSON.stringify(lists), [LEGACY_STORAGE_KEY]: JSON.stringify(todos) };
    expect(readLists(storage(items))).toEqual(lists);
  });

  it("starts with an empty Todos list", () => {
    expect(readLists(storage({}))).toEqual([{ id: 1, name: "Todos", todos: [] }]);
  });

  it("ignores unreadable storage", () => {
    expect(readLists(storage({ [STORAGE_KEY]: "{", [LEGACY_STORAGE_KEY]: "nope" }))).toEqual([
      { id: 1, name: "Todos", todos: [] },
    ]);
  });
});

describe("renameList", () => {
  const lists: TodoList[] = [
    { id: 1, name: "Todos", todos },
    { id: 2, name: "Work", todos: [] },
  ];

  it("renames only the given list and keeps its todos", () => {
    expect(renameList(lists, 1, "Home")).toEqual([
      { id: 1, name: "Home", todos },
      { id: 2, name: "Work", todos: [] },
    ]);
  });
});

describe("deleteList", () => {
  const lists: TodoList[] = [
    { id: 1, name: "Todos", todos },
    { id: 2, name: "Work", todos: [] },
  ];

  it("removes the given list", () => {
    expect(deleteList(lists, 1)).toEqual([{ id: 2, name: "Work", todos: [] }]);
  });

  it("keeps the last list", () => {
    expect(deleteList([lists[0]], 1)).toEqual([lists[0]]);
  });
});
