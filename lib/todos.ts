export type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

export type Filter = "all" | "active" | "completed";

export const FILTERS: Filter[] = ["all", "active", "completed"];

export const STORAGE_KEY = "todos-nextjs";

export function nextId(todos: Todo[]): number {
  // Use the highest id, not the count: after a delete the count would reuse a live id.
  return todos.reduce((max, todo) => Math.max(max, todo.id), 0) + 1;
}

// Earlier builds could save duplicate ids; give every repeat a fresh one so each todo is distinct.
export function dedupeIds(todos: Todo[]): Todo[] {
  const seen = new Set<number>();
  let next = nextId(todos);
  return todos.map((todo) => {
    if (!seen.has(todo.id)) {
      seen.add(todo.id);
      return todo;
    }
    return { ...todo, id: next++ };
  });
}

// Insert an active copy of the todo right after it, under a fresh id.
export function duplicateTodo(todos: Todo[], id: number): Todo[] {
  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) return todos;
  const copy: Todo = { id: nextId(todos), title: todos[index].title, completed: false };
  return [...todos.slice(0, index + 1), copy, ...todos.slice(index + 1)];
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
    return raw ? dedupeIds(JSON.parse(raw) as Todo[]) : [];
  } catch {
    return [];
  }
}

export function saveTodos(todos: Todo[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}
