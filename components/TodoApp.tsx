"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import TodoItem from "@/components/TodoItem";
import {
  filterTodos,
  loadTodos,
  nextId,
  pluralize,
  removeTodos,
  restoreTodos,
  saveTodos,
  UNDO_TIMEOUT_MS,
  type Filter,
  type Removed,
  type Todo,
} from "@/lib/todos";

const ENTER_KEY = "Enter";

export default function TodoApp({ filter }: { filter: Filter }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  // The most recent deletion, kept for a few seconds so it can be undone.
  const [lastRemoved, setLastRemoved] = useState<Removed[]>([]);

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
    if (lastRemoved.length === 0) return;
    const timer = setTimeout(() => setLastRemoved([]), UNDO_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [lastRemoved]);

  function addTodo(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== ENTER_KEY) return;
    const title = newTitle.trim();
    if (!title) return;
    // Count undoable todos too, so a restored todo never shares an id with a new one.
    const id = nextId([...todos, ...lastRemoved.map((removed) => removed.todo)]);
    setTodos([...todos, { id, title, completed: false }]);
    setNewTitle("");
  }

  function toggle(id: number) {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  }

  function toggleAll(completed: boolean) {
    setTodos(todos.map((todo) => ({ ...todo, completed })));
  }

  function remove(shouldRemove: (todo: Todo) => boolean) {
    const { kept, removed } = removeTodos(todos, shouldRemove);
    if (removed.length === 0) return;
    setTodos(kept);
    setLastRemoved(removed);
  }

  function destroy(id: number) {
    remove((todo) => todo.id === id);
  }

  function undo() {
    setTodos(restoreTodos(todos, lastRemoved));
    setLastRemoved([]);
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
    remove((todo) => todo.completed);
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
      {lastRemoved.length > 0 && (
        <div className="undo-bar" role="status" style={undoBarStyle}>
          <span>
            Deleted{" "}
            {lastRemoved.length === 1
              ? `"${lastRemoved[0].todo.title}"`
              : `${lastRemoved.length} ${pluralize(lastRemoved.length, "todo")}`}
          </span>
          <button className="undo" onClick={undo} style={undoButtonStyle}>
            Undo
          </button>
        </div>
      )}
      <footer className="info">
        <p>Double-click to edit a todo</p>
        <p>
          Part of <a href="https://todomvc.com">TodoMVC</a>
        </p>
      </footer>
    </>
  );
}

const undoBarStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  margin: "0 0 40px",
  padding: "12px 15px",
  background: "#333",
  color: "#fff",
  fontSize: 15,
  boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.2)",
};

const undoButtonStyle: React.CSSProperties = {
  color: "#f0c040",
  fontWeight: "bold",
  textTransform: "uppercase",
  cursor: "pointer",
};
