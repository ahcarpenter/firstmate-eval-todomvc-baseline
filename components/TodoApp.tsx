"use client";

import Link from "next/link";
import { useState } from "react";
import TodoItem from "@/components/TodoItem";
import { useTodos } from "@/components/useTodos";
import { filterTodos, pluralize, type Filter } from "@/lib/todos";

const ENTER_KEY = "Enter";

export default function TodoApp({ filter }: { filter: Filter }) {
  const [todos, dispatch] = useTodos();
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  function addTodo(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== ENTER_KEY) return;
    if (!newTitle.trim()) return;
    dispatch({ type: "add", title: newTitle });
    setNewTitle("");
  }

  function save(id: number, title: string) {
    dispatch({ type: "save", id, title });
    setEditingId(null);
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
              onChange={(event) => dispatch({ type: "toggleAll", completed: event.target.checked })}
            />
            <label htmlFor="toggle-all">Mark all as complete</label>
            <ul className="todo-list">
              {shown.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  editing={editingId === todo.id}
                  onToggle={() => dispatch({ type: "toggle", id: todo.id })}
                  onDestroy={() => dispatch({ type: "destroy", id: todo.id })}
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
              <button className="clear-completed" onClick={() => dispatch({ type: "clearCompleted" })}>
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
