"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import TodoItem from "@/components/TodoItem";
import {
  filterTodos,
  isOverdue,
  loadSortByDue,
  loadTodos,
  localDay,
  moveOverdueToToday,
  nextId,
  pluralize,
  saveSortByDue,
  saveTodos,
  searchTodos,
  sortByDue as sortTodosByDue,
  type Filter,
  type Todo,
} from "@/lib/todos";

const ENTER_KEY = "Enter";

export default function TodoApp({ filter }: { filter: Filter }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDue, setNewDue] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sortByDue, setSortByDue] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Read storage after mount so the server render and the first client render match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTodos(loadTodos());
    setSortByDue(loadSortByDue());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveTodos(todos);
  }, [todos, loaded]);

  useEffect(() => {
    if (loaded) saveSortByDue(sortByDue);
  }, [sortByDue, loaded]);

  function addTodo(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== ENTER_KEY) return;
    const title = newTitle.trim();
    if (!title) return;
    const todo: Todo = { id: nextId(todos), title, completed: false };
    if (newDue) todo.due = newDue;
    setTodos([...todos, todo]);
    setNewTitle("");
    setNewDue("");
  }

  function toggle(id: number) {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  }

  function toggleAll(completed: boolean) {
    setTodos(todos.map((todo) => ({ ...todo, completed })));
  }

  function destroy(id: number) {
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  /** Saves an edited todo; an empty `due` removes its due date. */
  function save(id: number, title: string, due: string) {
    const trimmed = title.trim();
    if (!trimmed) {
      destroy(id);
    } else {
      // An undefined `due` is dropped when the todos are saved as JSON.
      setTodos(todos.map((todo) => (todo.id === id ? { ...todo, title: trimmed, due: due || undefined } : todo)));
    }
    setEditingId(null);
  }

  function clearCompleted() {
    setTodos(todos.filter((todo) => !todo.completed));
  }

  function moveOverdue() {
    setTodos(moveOverdueToToday(todos, today));
  }

  // Todos load only after mount, so reading the clock here cannot cause a hydration mismatch.
  const today = localDay(new Date());
  const filtered = searchTodos(filterTodos(todos, filter, today), search);
  const shown = sortByDue ? sortTodosByDue(filtered) : filtered;
  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.length - activeCount;
  const overdueCount = todos.filter((todo) => isOverdue(todo, today)).length;

  return (
    <>
      <section className="todoapp">
        <header className="header">
          <h1>todos</h1>
          <div className="new-todo-row">
            <input
              className="new-todo"
              placeholder="What needs to be done?"
              autoFocus
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              onKeyDown={addTodo}
            />
            <label className="new-due">
              Due date
              <input type="date" value={newDue} onChange={(event) => setNewDue(event.target.value)} onKeyDown={addTodo} />
            </label>
          </div>
        </header>
        {todos.length > 0 && (
          <section className="main">
            <input
              id="toggle-all"
              className="toggle-all"
              type="checkbox"
              checked={activeCount === 0}
              onChange={(event) => toggleAll(event.target.checked)}
            />
            <label htmlFor="toggle-all">Mark all as complete</label>
            <label className="search">
              Search
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
            <ul className="todo-list">
              {shown.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  editing={editingId === todo.id}
                  overdue={isOverdue(todo, today)}
                  today={today}
                  onToggle={() => toggle(todo.id)}
                  onDestroy={() => destroy(todo.id)}
                  onEdit={() => setEditingId(todo.id)}
                  onSave={(title, due) => save(todo.id, title, due)}
                  onCancel={() => setEditingId(null)}
                />
              ))}
            </ul>
          </section>
        )}
        {todos.length > 0 && (
          <footer className="footer">
            <span className="todo-count">
              <strong>{activeCount}</strong> {pluralize(activeCount, "item")} left
              {overdueCount > 0 && <span className="overdue-count">{overdueCount} overdue</span>}
            </span>
            <ul className="filters">
              <li>
                <Link href="/" className={filter === "all" ? "selected" : undefined}>
                  All
                </Link>
              </li>
              <li>
                <Link href="/active" className={filter === "active" ? "selected" : undefined}>
                  Active
                </Link>
              </li>
              <li>
                <Link href="/completed" className={filter === "completed" ? "selected" : undefined}>
                  Completed
                </Link>
              </li>
              <li>
                <Link href="/overdue" className={filter === "overdue" ? "selected" : undefined}>
                  Overdue
                </Link>
              </li>
            </ul>
            {overdueCount > 0 && (
              <button className="move-overdue" onClick={moveOverdue}>
                Move overdue to today
              </button>
            )}
            <label className="sort-by-due">
              <input type="checkbox" checked={sortByDue} onChange={(event) => setSortByDue(event.target.checked)} />
              Sort by date
            </label>
            {completedCount > 0 && (
              <button className="clear-completed" onClick={clearCompleted}>
                Clear completed
              </button>
            )}
          </footer>
        )}
      </section>
      <footer className="info">
        <p>Double-click to edit a todo</p>
        <p>
          Part of <a href="https://todomvc.com">TodoMVC</a>
        </p>
      </footer>
    </>
  );
}
