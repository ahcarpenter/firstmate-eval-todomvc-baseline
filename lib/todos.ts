export type Todo = {
  id: number;
  title: string;
  completed: boolean;
  /** Optional due date as a `YYYY-MM-DD` string, the value of an `<input type="date">`. */
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

export function filterTodos(todos: Todo[], filter: Filter): Todo[] {
  if (filter === "active") return todos.filter((todo) => !todo.completed);
  if (filter === "completed") return todos.filter((todo) => todo.completed);
  return todos;
}

const DUE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Formats a `YYYY-MM-DD` due date as "Due Nov 3", or returns null when it is missing or malformed. */
export function formatDue(due: string | undefined): string | null {
  const match = due ? DUE_PATTERN.exec(due) : null;
  if (!match) return null;
  // Build the date in UTC and format it in UTC so the calendar day never shifts with the local time zone.
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `Due ${date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}`;
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
