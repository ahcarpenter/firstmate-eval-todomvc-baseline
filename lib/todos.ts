export type Todo = {
  id: number;
  title: string;
  completed: boolean;
  /** Optional due date as a `YYYY-MM-DD` string, the value of an `<input type="date">`. */
  due?: string;
};

export type Filter = "all" | "active" | "completed" | "overdue";

export const FILTERS: Filter[] = ["all", "active", "completed", "overdue"];

export const STORAGE_KEY = "todos-nextjs";

export function nextId(todos: Todo[]): number {
  return todos.length + 1;
}

export function pluralize(count: number, word: string): string {
  return count === 1 ? word : `${word}s`;
}

/** `today` is the local calendar day as `YYYY-MM-DD`; it decides which todos are overdue. */
export function filterTodos(todos: Todo[], filter: Filter, today: string): Todo[] {
  if (filter === "active") return todos.filter((todo) => !todo.completed);
  if (filter === "completed") return todos.filter((todo) => todo.completed);
  if (filter === "overdue") return todos.filter((todo) => isOverdue(todo, today));
  return todos;
}

const DUE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parses a `YYYY-MM-DD` due date as a UTC midnight date, or returns null when it is missing or malformed. */
function parseDue(due: string | undefined): Date | null {
  const match = due ? DUE_PATTERN.exec(due) : null;
  if (!match) return null;
  // Build the date in UTC so the calendar day never shifts with the local time zone.
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

/** Formats a `YYYY-MM-DD` due date as "Due Nov 3", or returns null when it is missing or malformed. */
export function formatDue(due: string | undefined): string | null {
  const date = parseDue(due);
  if (!date) return null;
  return `Due ${date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}`;
}

/** Returns the local calendar day of `now` as `YYYY-MM-DD`, comparable with a todo's due date. */
export function localDay(now: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** A todo is overdue when it is not completed and has a valid due date before `today` (`YYYY-MM-DD`). */
export function isOverdue(todo: Todo, today: string): boolean {
  // Zero-padded `YYYY-MM-DD` strings sort in calendar order, so a string comparison is a date comparison.
  if (todo.completed || !todo.due || !parseDue(todo.due)) return false;
  return todo.due < today;
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
