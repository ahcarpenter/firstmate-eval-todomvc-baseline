export type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

export type Filter = "all" | "active" | "completed";

export const FILTERS: Filter[] = ["all", "active", "completed"];

export const STORAGE_KEY = "todos-nextjs";

export function nextId(todos: Todo[]): number {
  // Derive from the largest id, not the count: after a delete the count no longer
  // tracks the ids in use, and reusing one makes two todos share an id.
  return todos.reduce((max, todo) => Math.max(max, todo.id), 0) + 1;
}

// Give every todo a distinct id, keeping the first occurrence of each id as is.
// Repairs lists saved before nextId stopped reusing ids.
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
