"use client";

import { useState } from "react";
import TodoFooter from "@/components/TodoFooter";
import TodoItem from "@/components/TodoItem";
import { useTodos } from "@/hooks/useTodos";
import { filterTodos, type Filter } from "@/lib/todos";

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
          <TodoFooter
            filter={filter}
            activeCount={activeCount}
            completedCount={completedCount}
            onClearCompleted={() => dispatch({ type: "clearCompleted" })}
          />
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
