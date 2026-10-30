export type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

export type Filter = "all" | "active" | "completed";

export const FILTERS: Filter[] = ["all", "active", "completed"];

export const STORAGE_KEY = "todos-nextjs";

export function nextId(todos: Todo[]): number {
  return todos.length + 1;
}

export function pluralize(count: number, word: string): string {
  return count === 1 ? word : `${word}s`;
}

// Titles match ignoring case and runs of whitespace, so "Buy  Milk" duplicates "buy milk".
function normalizeTitle(title: string): string {
  return title.trim().replace(/\s+/g, " ").toLowerCase();
}

// Pass exceptId when renaming so a todo never counts as a duplicate of itself.
export function findActiveDuplicate(todos: Todo[], title: string, exceptId?: number): Todo | undefined {
  const wanted = normalizeTitle(title);
  return todos.find((todo) => todo.id !== exceptId && !todo.completed && normalizeTitle(todo.title) === wanted);
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
