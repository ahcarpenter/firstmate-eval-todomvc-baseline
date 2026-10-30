export type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

export type Filter = "all" | "active" | "completed";

export const FILTERS: Filter[] = ["all", "active", "completed"];

export const STORAGE_KEY = "todos-nextjs";

export const UNDO_DELETE_MS = 5000;

export type DeletedTodo = {
  todo: Todo;
  index: number;
};

export function nextId(todos: Todo[]): number {
  return todos.reduce((max, todo) => Math.max(max, todo.id), 0) + 1;
}

export function removeTodo(todos: Todo[], id: number): { todos: Todo[]; deleted: DeletedTodo | null } {
  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) return { todos, deleted: null };
  return { todos: todos.filter((todo) => todo.id !== id), deleted: { todo: todos[index], index } };
}

export function restoreTodo(todos: Todo[], { todo, index }: DeletedTodo): Todo[] {
  const at = Math.min(index, todos.length);
  return [...todos.slice(0, at), todo, ...todos.slice(at)];
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
