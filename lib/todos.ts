export type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

export type Filter = "all" | "active" | "completed";

export const FILTERS: Filter[] = ["all", "active", "completed"];

export const STORAGE_KEY = "todos-nextjs";

export const UNDO_TIMEOUT_MS = 5000;

/** A todo taken out of the list, with the position it held, so it can be put back. */
export type Removed = { todo: Todo; index: number };

export function nextId(todos: Todo[]): number {
  // Follow the highest id, not the count, so ids stay unique after deletes and undos.
  return todos.reduce((max, todo) => Math.max(max, todo.id), 0) + 1;
}

export function removeTodos(todos: Todo[], shouldRemove: (todo: Todo) => boolean): { kept: Todo[]; removed: Removed[] } {
  const kept: Todo[] = [];
  const removed: Removed[] = [];
  todos.forEach((todo, index) => {
    if (shouldRemove(todo)) removed.push({ todo, index });
    else kept.push(todo);
  });
  return { kept, removed };
}

export function restoreTodos(todos: Todo[], removed: Removed[]): Todo[] {
  const restored = [...todos];
  // Ascending order puts each todo back where it was relative to the ones restored before it.
  for (const { todo, index } of [...removed].sort((a, b) => a.index - b.index)) {
    restored.splice(Math.min(index, restored.length), 0, todo);
  }
  return restored;
}

export function pluralize(count: number, word: string): string {
  return count === 1 ? word : `${word}s`;
}

export function filterTodos(todos: Todo[], filter: Filter): Todo[] {
  if (filter === "active") return todos.filter((todo) => !todo.completed);
  if (filter === "completed") return todos.filter((todo) => todo.completed);
  return todos;
}

export function loadTodos(): Todo[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Todo[]) : [];
  } catch {
    return [];
  }
}

export function saveTodos(todos: Todo[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}
