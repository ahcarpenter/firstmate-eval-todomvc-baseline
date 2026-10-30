export type Todo = {
  id: number;
  title: string;
  completed: boolean;
  // Calendar date as YYYY-MM-DD, the value of an <input type="date">.
  due?: string;
};

export type Filter = "all" | "active" | "completed" | "overdue";

export const FILTERS: Filter[] = ["all", "active", "completed", "overdue"];

export const STORAGE_KEY = "todos-nextjs";

export const SORT_STORAGE_KEY = "todos-nextjs-sort-by-due";

// Session storage, so the search survives switching filters but not a new tab.
export const SEARCH_STORAGE_KEY = "todos-nextjs-search";

export function nextId(todos: Todo[]): number {
  return todos.length + 1;
}

export function pluralize(count: number, word: string): string {
  return count === 1 ? word : `${word}s`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Read the date parts directly so the shown day never shifts with the time zone.
// Given `today`, a date due today or tomorrow reads as "Due today" or "Due tomorrow".
export function formatDue(due: string, today?: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(due);
  if (!match) return null;
  const month = MONTHS[Number(match[2]) - 1];
  const day = Number(match[3]);
  if (!month || day < 1 || day > 31) return null;
  if (today && due === today) return "Due today";
  if (today && due === tomorrowKey(today)) return "Due tomorrow";
  return `Due ${month} ${day}`;
}

// Today's local calendar date as YYYY-MM-DD, comparable with `due` as a string.
export function todayKey(now: Date = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

// The calendar day after `today`; Date rolls the day over months and years.
export function tomorrowKey(today: string): string {
  const [year, month, day] = today.split("-").map(Number);
  return todayKey(new Date(year, month - 1, day + 1));
}

export function isOverdue(todo: Todo, today: string): boolean {
  if (todo.completed || !todo.due || formatDue(todo.due) === null) return false;
  return todo.due < today;
}

// Reschedule every overdue todo to `today`, leaving the rest untouched.
export function moveOverdueToToday(todos: Todo[], today: string): Todo[] {
  return todos.map((todo) => (isOverdue(todo, today) ? { ...todo, due: today } : todo));
}

// Apply an edit; an empty `due` removes the date.
export function editTodo(todo: Todo, title: string, due: string): Todo {
  const edited: Todo = { ...todo, title };
  if (due) edited.due = due;
  else delete edited.due;
  return edited;
}

export function filterTodos(todos: Todo[], filter: Filter, today: string = todayKey()): Todo[] {
  if (filter === "active") return todos.filter((todo) => !todo.completed);
  if (filter === "completed") return todos.filter((todo) => todo.completed);
  if (filter === "overdue") return todos.filter((todo) => isOverdue(todo, today));
  return todos;
}

// Todos whose title contains `query`, ignoring letter case; an empty query keeps them all.
export function searchTodos(todos: Todo[], query: string): Todo[] {
  const needle = query.toLowerCase();
  return todos.filter((todo) => todo.title.toLowerCase().includes(needle));
}

// Earliest due date first; undated todos go last. The sort is stable, so ties keep their order.
export function sortByDue(todos: Todo[]): Todo[] {
  const key = (todo: Todo) => (todo.due && formatDue(todo.due) !== null ? todo.due : null);
  return [...todos].sort((a, b) => {
    const dueA = key(a);
    const dueB = key(b);
    if (dueA === dueB) return 0;
    if (dueA === null) return 1;
    if (dueB === null) return -1;
    return dueA < dueB ? -1 : 1;
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

export function loadSortByDue(): boolean {
  try {
    return window.localStorage.getItem(SORT_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function saveSortByDue(sortByDue: boolean): void {
  window.localStorage.setItem(SORT_STORAGE_KEY, String(sortByDue));
}

export function loadSearch(): string {
  try {
    return window.sessionStorage.getItem(SEARCH_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveSearch(search: string): void {
  window.sessionStorage.setItem(SEARCH_STORAGE_KEY, search);
}
