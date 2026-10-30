import { STORAGE_KEY as LEGACY_TODOS_KEY, type Todo } from "./todos";

export type TodoList = {
  id: string;
  name: string;
  todos: Todo[];
};

export const LISTS_STORAGE_KEY = "todolists-nextjs";

export const DEFAULT_LIST_NAME = "Todos";

export function nextListId(lists: TodoList[]): string {
  const max = lists.reduce((highest, list) => Math.max(highest, Number(list.id) || 0), 0);
  return String(max + 1);
}

export function addList(lists: TodoList[], name: string): [TodoList[], TodoList] {
  const list = { id: nextListId(lists), name, todos: [] };
  return [[...lists, list], list];
}

export function renameList(lists: TodoList[], id: string, name: string): TodoList[] {
  return lists.map((list) => (list.id === id ? { ...list, name } : list));
}

// The last list stays, so there is always one to open at `/`.
export function removeList(lists: TodoList[], id: string): TodoList[] {
  if (lists.length <= 1) return lists;
  return lists.filter((list) => list.id !== id);
}

export function replaceTodos(lists: TodoList[], id: string, todos: Todo[]): TodoList[] {
  return lists.map((list) => (list.id === id ? { ...list, todos } : list));
}

// Turns stored data into lists. Todos saved before lists existed become a list
// called "Todos", and there is always at least one list to open at `/`.
export function parseLists(rawLists: string | null, rawLegacyTodos: string | null): TodoList[] {
  if (rawLists) {
    const lists = JSON.parse(rawLists) as TodoList[];
    if (lists.length > 0) return lists;
  }
  const todos = rawLegacyTodos ? (JSON.parse(rawLegacyTodos) as Todo[]) : [];
  return [{ id: "1", name: DEFAULT_LIST_NAME, todos }];
}

export function loadLists(): TodoList[] {
  try {
    return parseLists(
      window.localStorage.getItem(LISTS_STORAGE_KEY),
      window.localStorage.getItem(LEGACY_TODOS_KEY),
    );
  } catch {
    return parseLists(null, null);
  }
}

export function saveLists(lists: TodoList[]): void {
  window.localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists));
}
