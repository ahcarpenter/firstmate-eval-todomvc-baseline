export type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

export type Filter = "all" | "active" | "completed";

export const FILTERS: Filter[] = ["all", "active", "completed"];

export const STORAGE_KEY = "todos-nextjs";

export const UNDO_DELETE_MS = 5000;

export function nextId(todos: Todo[]): number {
  return todos.reduce((max, todo) => Math.max(max, todo.id), 0) + 1;
}

// Puts a deleted todo back at its old position. It gets a fresh id if a todo
// added since the delete has taken its old one.
export function restoreTodo(todos: Todo[], todo: Todo, index: number): Todo[] {
  const restored = todos.some((other) => other.id === todo.id) ? { ...todo, id: nextId(todos) } : todo;
  const at = Math.min(Math.max(index, 0), todos.length);
  return [...todos.slice(0, at), restored, ...todos.slice(at)];
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
