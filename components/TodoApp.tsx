"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import TodoItem from "@/components/TodoItem";
import { filterTodos, loadTodos, nextId, pluralize, saveTodos, type Filter, type Todo } from "@/lib/todos";

const ENTER_KEY = "Enter";

export default function TodoApp({ filter }: { filter: Filter }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  // Where focus should land after a todo leaves the list while holding focus: a todo id, or "new" for the input.
  const [focusAfterRemoval, setFocusAfterRemoval] = useState<number | "new" | null>(null);
  const newTodoInput = useRef<HTMLInputElement>(null);
  const todoList = useRef<HTMLUListElement>(null);

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
    if (focusAfterRemoval === null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFocusAfterRemoval(null);
    if (document.activeElement && document.activeElement !== document.body) return;
    const toggle = todoList.current?.querySelector<HTMLInputElement>(`li[data-todo-id="${focusAfterRemoval}"] .toggle`);
    (toggle ?? newTodoInput.current)?.focus();
  }, [focusAfterRemoval]);

  function addTodo(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== ENTER_KEY) return;
    const title = newTitle.trim();
    if (!title) return;
    setTodos([...todos, { id: nextId(todos), title, completed: false }]);
    setNewTitle("");
  }

  function toggle(id: number) {
    // Under the Active or Completed filter, toggling moves the todo out of view.
    if (filter !== "all") refocusAfterRemoving(id);
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  }

  function toggleAll(completed: boolean) {
    setTodos(todos.map((todo) => ({ ...todo, completed })));
  }

  function destroy(id: number) {
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  function refocusAfterRemoving(id: number) {
    const index = shown.findIndex((todo) => todo.id === id);
    const neighbour = shown[index + 1] ?? shown[index - 1];
    setFocusAfterRemoval(neighbour ? neighbour.id : "new");
  }

  function destroyAndRefocus(id: number) {
    refocusAfterRemoving(id);
    destroy(id);
  }

  function save(id: number, title: string) {
    const trimmed = title.trim();
    if (!trimmed) {
      destroyAndRefocus(id);
    } else {
      setTodos(todos.map((todo) => (todo.id === id ? { ...todo, title: trimmed } : todo)));
    }
    setEditingId(null);
  }

  function clearCompleted() {
    setTodos(todos.filter((todo) => !todo.completed));
    setFocusAfterRemoval("new");
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
            ref={newTodoInput}
            className="new-todo"
            aria-label="New todo"
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
            <ul className="todo-list" ref={todoList}>
              {shown.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  editing={editingId === todo.id}
                  onToggle={() => toggle(todo.id)}
                  onDestroy={() => destroyAndRefocus(todo.id)}
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
            <ul className="filters" aria-label="Filter todos">
              <li>
                <Link href="/" className={filter === "all" ? "selected" : undefined} aria-current={filter === "all" ? "page" : undefined}>
                  All
                </Link>
              </li>
              <li>
                <Link href="/active" className={filter === "active" ? "selected" : undefined} aria-current={filter === "active" ? "page" : undefined}>
                  Active
                </Link>
              </li>
              <li>
                <Link href="/completed" className={filter === "completed" ? "selected" : undefined} aria-current={filter === "completed" ? "page" : undefined}>
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
      <footer className="info">
        <p>Double-click or use the Edit button to edit a todo</p>
        <p>
          Part of <a href="https://todomvc.com">TodoMVC</a>
        </p>
      </footer>
    </>
  );
}
