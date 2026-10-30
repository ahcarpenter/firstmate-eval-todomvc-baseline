import { describe, expect, it } from "vitest";
import {
  addList,
  deleteList,
  filterTodos,
  listPath,
  nextId,
  parseLists,
  pluralize,
  renameList,
  slugify,
  type Todo,
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
  it("leaves out the all filter", () => {
    expect(listPath("groceries")).toBe("/lists/groceries");
    expect(listPath("groceries", "all")).toBe("/lists/groceries");
  });

  it("appends other filters", () => {
    expect(listPath("groceries", "active")).toBe("/lists/groceries/active");
    expect(listPath("groceries", "completed")).toBe("/lists/groceries/completed");
  });
});

describe("slugify", () => {
  it("makes a URL-safe id from the name", () => {
    expect(slugify("  Weekend Chores! ")).toBe("weekend-chores");
  });

  it("falls back when nothing is left", () => {
    expect(slugify("!!!")).toBe("list");
  });
});

describe("addList", () => {
  it("appends an empty list", () => {
    expect(addList([], "Groceries")).toEqual([{ id: "groceries", name: "Groceries", todos: [] }]);
  });

  it("keeps ids unique", () => {
    const lists = addList(addList([], "Groceries"), "groceries");
    expect(addList(lists, "Groceries!").map((list) => list.id)).toEqual(["groceries", "groceries-2", "groceries-3"]);
  });
});

describe("renameList", () => {
  it("changes only the name of the matching list", () => {
    const lists = addList(addList([], "Groceries"), "Work");
    expect(renameList(lists, "work", "Office")).toEqual([
      { id: "groceries", name: "Groceries", todos: [] },
      { id: "work", name: "Office", todos: [] },
    ]);
  });
});

describe("deleteList", () => {
  it("removes the matching list and its todos", () => {
    const lists = addList(addList([], "Groceries"), "Work");
    lists[1].todos = todos;
    expect(deleteList(lists, "work")).toEqual([{ id: "groceries", name: "Groceries", todos: [] }]);
  });

  it("keeps the last remaining list", () => {
    const lists = addList([], "Groceries");
    expect(deleteList(lists, "groceries")).toEqual(lists);
  });
});

describe("parseLists", () => {
  it("starts with an empty Todos list", () => {
    expect(parseLists(null, null)).toEqual([{ id: "todos", name: "Todos", todos: [] }]);
  });

  it("moves legacy todos into a Todos list", () => {
    expect(parseLists(null, JSON.stringify(todos))).toEqual([{ id: "todos", name: "Todos", todos }]);
  });

  it("prefers saved lists over legacy todos", () => {
    const lists = [{ id: "groceries", name: "Groceries", todos: [] }];
    expect(parseLists(JSON.stringify(lists), JSON.stringify(todos))).toEqual(lists);
  });

  it("ignores unreadable storage", () => {
    expect(parseLists("{", "{")).toEqual([{ id: "todos", name: "Todos", todos: [] }]);
  });
});
