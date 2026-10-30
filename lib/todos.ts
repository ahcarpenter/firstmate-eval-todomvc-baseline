export type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

export type TodoList = {
  id: number;
  name: string;
  todos: Todo[];
};

export type Filter = "all" | "active" | "completed";

export const FILTERS: Filter[] = ["all", "active", "completed"];

// Todos saved before lists existed live here; they become the "Todos" list.
export const LEGACY_STORAGE_KEY = "todos-nextjs";

export const STORAGE_KEY = "todos-nextjs-lists";

export const DEFAULT_LIST_NAME = "Todos";

export function nextId(items: { id: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

export function pluralize(count: number, word: string): string {
  return count === 1 ? word : `${word}s`;
}

export function filterTodos(todos: Todo[], filter: Filter): Todo[] {
  if (filter === "active") return todos.filter((todo) => !todo.completed);
  if (filter === "completed") return todos.filter((todo) => todo.completed);
  return todos;
}

export function listPath(listId: number | string, filter: Filter = "all"): string {
  return filter === "all" ? `/lists/${listId}` : `/lists/${listId}/${filter}`;
}

function parse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// Always returns at least one list so `/` has a first list to open.
export function readLists(storage: Pick<Storage, "getItem">): TodoList[] {
  const lists = parse<TodoList[]>(storage.getItem(STORAGE_KEY));
  if (Array.isArray(lists) && lists.length > 0) return lists;
  const legacy = parse<Todo[]>(storage.getItem(LEGACY_STORAGE_KEY));
  return [{ id: 1, name: DEFAULT_LIST_NAME, todos: Array.isArray(legacy) ? legacy : [] }];
}

export function loadLists(): TodoList[] {
  try {
    return readLists(window.localStorage);
  } catch {
    return readLists({ getItem: () => null });
  }
}

export function saveLists(lists: TodoList[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}
