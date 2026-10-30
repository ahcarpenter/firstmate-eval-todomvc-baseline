"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import TodoItem from "@/components/TodoItem";
import {
  UNDO_DELETE_MS,
  filterTodos,
  loadTodos,
  nextId,
  pluralize,
  restoreTodos,
  saveTodos,
  type Filter,
  type Removed,
  type Todo,
} from "@/lib/todos";

const ENTER_KEY = "Enter";

// What the undo toast can bring back: one deleted todo or every cleared one.
type Deleted = { removed: Removed[]; message: string };

export default function TodoApp({ filter }: { filter: Filter }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleted, setDeleted] = useState<Deleted | null>(null);

  useEffect(() => {
    // Read storage after mount so the server render and the first client render match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTodos(loadTodos());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveTodos(todos);
  }, [todos, loaded]);

  useEffect(() => {
    // Each delete or clear starts a fresh undo window and replaces any older one.
    if (!deleted) return;
    const timer = setTimeout(() => setDeleted(null), UNDO_DELETE_MS);
    return () => clearTimeout(timer);
  }, [deleted]);

  function addTodo(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== ENTER_KEY) return;
    const title = newTitle.trim();
    if (!title) return;
    setTodos([...todos, { id: nextId(todos), title, completed: false }]);
    setNewTitle("");
  }

  function toggle(id: number) {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  }

  function toggleAll(completed: boolean) {
    setTodos(todos.map((todo) => ({ ...todo, completed })));
  }

  function destroy(id: number) {
    const index = todos.findIndex((todo) => todo.id === id);
    if (index === -1) return;
    const todo = todos[index];
    setDeleted({ removed: [{ todo, index }], message: `Deleted “${todo.title}”` });
    setTodos(todos.filter((other) => other.id !== id));
  }

  function undoDelete() {
    if (!deleted) return;
    setTodos(restoreTodos(todos, deleted.removed));
    setDeleted(null);
  }

  function save(id: number, title: string) {
    const trimmed = title.trim();
    if (!trimmed) {
      destroy(id);
    } else {
      setTodos(todos.map((todo) => (todo.id === id ? { ...todo, title: trimmed } : todo)));
    }
    setEditingId(null);
  }

  function clearCompleted() {
    const removed = todos.flatMap((todo, index) => (todo.completed ? [{ todo, index }] : []));
    if (removed.length === 0) return;
    setDeleted({ removed, message: `Cleared ${removed.length} completed ${pluralize(removed.length, "todo")}` });
    setTodos(todos.filter((todo) => !todo.completed));
  }

  const shown = filterTodos(todos, filter);
  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.length - activeCount;

  return (
    <>
      <section className="todoapp">
        <header className="header">
          <h1>todos</h1>
          <input
            className="new-todo"
            placeholder="What needs to be done?"
            autoFocus
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            onKeyDown={addTodo}
          />
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
            <ul className="todo-list">
              {shown.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  editing={editingId === todo.id}
                  onToggle={() => toggle(todo.id)}
                  onDestroy={() => destroy(todo.id)}
                  onEdit={() => setEditingId(todo.id)}
                  onSave={(title) => save(todo.id, title)}
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
            </ul>
            {completedCount > 0 && (
              <button className="clear-completed" onClick={clearCompleted}>
                Clear completed
              </button>
            )}
          </footer>
        )}
      </section>
      <div className="undo-toast" role="status">
        {deleted && (
          <>
            <span>{deleted.message}</span>
            <button onClick={undoDelete}>Undo</button>
          </>
        )}
      </div>
      <footer className="info">
        <p>Double-click to edit a todo</p>
        <p>
          Part of <a href="https://todomvc.com">TodoMVC</a>
        </p>
      </footer>
    </>
  );
}
