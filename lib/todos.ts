export type Todo = {
  id: number;
  title: string;
  completed: boolean;
  // Calendar date as YYYY-MM-DD, the value of an <input type="date">.
  dueDate?: string;
};

export type Filter = "all" | "active" | "completed" | "overdue";

export const FILTERS: Filter[] = ["all", "active", "completed", "overdue"];

export const STORAGE_KEY = "todos-nextjs";

export const SORT_BY_DATE_KEY = "todos-nextjs-sort-by-date";

export function nextId(todos: Todo[]): number {
  return todos.length + 1;
}

export function pluralize(count: number, word: string): string {
  return count === 1 ? word : `${word}s`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Formats a YYYY-MM-DD date as "Due today", "Due tomorrow", or otherwise
// "Due Nov 3", relative to today (also YYYY-MM-DD). Parses the parts directly
// so the day never shifts with the viewer's time zone.
export function formatDueDate(dueDate: string, today: string): string {
  if (dueDate === today) return "Due today";
  if (dueDate === nextDate(today)) return "Due tomorrow";
  const [, month, day] = dueDate.split("-").map(Number);
  return `Due ${MONTHS[month - 1]} ${day}`;
}

// The calendar day after a YYYY-MM-DD date. Date rolls the day over month and
// year ends; local noon keeps DST changes from moving it to another day.
function nextDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return localDate(new Date(year, month - 1, day + 1, 12));
}

// The viewer's local calendar date as YYYY-MM-DD, comparable with dueDate.
export function localDate(now: Date): string {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

// A todo is overdue when it is not completed and its due date is before today.
// YYYY-MM-DD strings sort in date order, so a string comparison is enough.
export function isOverdue(todo: Todo, today: string): boolean {
  return !todo.completed && todo.dueDate !== undefined && todo.dueDate < today;
}

// Moves every overdue todo's due date to today, leaving other todos as they are.
export function moveOverdueToToday(todos: Todo[], today: string): Todo[] {
  return todos.map((todo) => (isOverdue(todo, today) ? { ...todo, dueDate: today } : todo));
}

export function filterTodos(todos: Todo[], filter: Filter, today: string): Todo[] {
  if (filter === "active") return todos.filter((todo) => !todo.completed);
  if (filter === "completed") return todos.filter((todo) => todo.completed);
  if (filter === "overdue") return todos.filter((todo) => isOverdue(todo, today));
  return todos;
}

// Todos whose title contains the query, ignoring letter case. An empty query
// matches every todo.
export function searchTodos(todos: Todo[], query: string): Todo[] {
  const needle = query.toLowerCase();
  return todos.filter((todo) => todo.title.toLowerCase().includes(needle));
}

// Earliest due date first, undated todos last. The sort is stable, so todos
// with the same due date (or none) keep their usual order.
export function sortByDueDate(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    if (a.dueDate === b.dueDate) return 0;
    if (a.dueDate === undefined) return 1;
    if (b.dueDate === undefined) return -1;
    return a.dueDate < b.dueDate ? -1 : 1;
  });
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

export function loadSortByDate(): boolean {
  try {
    return window.localStorage.getItem(SORT_BY_DATE_KEY) === "true";
  } catch {
    return false;
  }
}

export function saveSortByDate(sortByDate: boolean): void {
  window.localStorage.setItem(SORT_BY_DATE_KEY, String(sortByDate));
}
