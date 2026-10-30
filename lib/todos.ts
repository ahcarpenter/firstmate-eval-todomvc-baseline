export type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

export type TodoList = {
  id: string;
  name: string;
  todos: Todo[];
};

export type Filter = "all" | "active" | "completed";

export const FILTERS: Filter[] = ["all", "active", "completed"];

// Todos saved before lists existed; read once to migrate them into the "Todos" list.
export const LEGACY_STORAGE_KEY = "todos-nextjs";

export const STORAGE_KEY = "todos-nextjs-lists";

export const DEFAULT_LIST_NAME = "Todos";

export function nextId(todos: Todo[]): number {
  return todos.length + 1;
}

export function pluralize(count: number, word: string): string {
  return count === 1 ? word : `${word}s`;
}

export function filterTodos(todos: Todo[], filter: Filter): Todo[] {
  if (filter === "active") return todos.filter((todo) => !todo.completed);
  if (filter === "completed") return todos.filter((todo) => todo.completed);
  return todos;
}

export function listPath(listId: string, filter: Filter = "all"): string {
  const base = `/lists/${encodeURIComponent(listId)}`;
  return filter === "all" ? base : `${base}/${filter}`;
}

export function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "list";
}

export function addList(lists: TodoList[], name: string): TodoList[] {
  const base = slugify(name);
  const taken = new Set(lists.map((list) => list.id));
  let id = base;
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
  return [...lists, { id, name, todos: [] }];
}

// Builds the saved lists, turning legacy todos into a "Todos" list so nobody loses them.
export function parseLists(raw: string | null, legacyRaw: string | null): TodoList[] {
  if (raw) {
    try {
      const lists = JSON.parse(raw) as TodoList[];
      if (Array.isArray(lists) && lists.length > 0) return lists;
    } catch {
      // Fall through to the legacy todos.
    }
  }
  let todos: Todo[] = [];
  if (legacyRaw) {
    try {
      const legacy = JSON.parse(legacyRaw) as Todo[];
      if (Array.isArray(legacy)) todos = legacy;
    } catch {
      // Unreadable legacy todos leave the list empty.
    }
  }
  return [{ id: slugify(DEFAULT_LIST_NAME), name: DEFAULT_LIST_NAME, todos }];
}

export function loadLists(): TodoList[] {
  try {
    return parseLists(window.localStorage.getItem(STORAGE_KEY), window.localStorage.getItem(LEGACY_STORAGE_KEY));
  } catch {
    return parseLists(null, null);
  }
}

export function saveLists(lists: TodoList[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}
