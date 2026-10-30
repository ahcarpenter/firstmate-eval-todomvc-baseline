export type Todo = {
  id: number;
  title: string;
  completed: boolean;
  // Calendar date as YYYY-MM-DD, the value of an <input type="date">.
  due?: string;
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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Read the date parts directly so the shown day never shifts with the time zone.
export function formatDue(due: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(due);
  if (!match) return null;
  const month = MONTHS[Number(match[2]) - 1];
  const day = Number(match[3]);
  if (!month || day < 1 || day > 31) return null;
  return `Due ${month} ${day}`;
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
