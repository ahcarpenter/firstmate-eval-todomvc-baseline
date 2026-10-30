"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TodoItem from "@/components/TodoItem";
import {
  FILTERS,
  addList,
  filterTodos,
  listPath,
  loadLists,
  nextId,
  pluralize,
  saveLists,
  type Filter,
  type Todo,
  type TodoList,
} from "@/lib/todos";

const ENTER_KEY = "Enter";

const FILTER_LABELS: Record<Filter, string> = { all: "All", active: "Active", completed: "Completed" };

// listId null opens the first list.
export default function TodoApp({ listId, filter }: { listId: string | null; filter: Filter }) {
  const router = useRouter();
  const [lists, setLists] = useState<TodoList[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newListName, setNewListName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    // Read storage after mount so the server render and the first client render match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLists(loadLists());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveLists(lists);
  }, [lists, loaded]);

  const list = listId === null ? lists[0] : lists.find((candidate) => candidate.id === listId);
  const todos = list?.todos ?? [];

  function setTodos(next: Todo[]) {
    if (!list) return;
    setLists(lists.map((candidate) => (candidate.id === list.id ? { ...candidate, todos: next } : candidate)));
  }

  function createList(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== ENTER_KEY) return;
    const name = newListName.trim();
    if (!name) return;
    const next = addList(lists, name);
    // Save before navigating so the next page reads the new list.
    saveLists(next);
    setLists(next);
    setNewListName("");
    router.push(listPath(next[next.length - 1].id));
  }

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
    setTodos(todos.filter((todo) => todo.id !== id));
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
          {loaded && list && <h2 className="list-name">{list.name}</h2>}
          {loaded && !list && <p className="list-missing">This list does not exist.</p>}
          <input
            className="new-todo"
            placeholder="What needs to be done?"
            autoFocus
            disabled={!list}
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
        {list && todos.length > 0 && (
          <footer className="footer">
            <span className="todo-count">
              <strong>{activeCount}</strong> {pluralize(activeCount, "item")} left
            </span>
            <ul className="filters">
              {FILTERS.map((name) => (
                <li key={name}>
                  <Link href={listPath(list.id, name)} className={filter === name ? "selected" : undefined}>
                    {FILTER_LABELS[name]}
                  </Link>
                </li>
              ))}
            </ul>
            {completedCount > 0 && (
              <button className="clear-completed" onClick={clearCompleted}>
                Clear completed
              </button>
            )}
          </footer>
        )}
      </section>
      <nav className="lists" aria-label="Lists">
        <label htmlFor="new-list">New list name</label>
        <input
          id="new-list"
          className="new-list"
          value={newListName}
          onChange={(event) => setNewListName(event.target.value)}
          onKeyDown={createList}
        />
        <ul>
          {lists.map((candidate) => (
            <li key={candidate.id}>
              <Link
                href={listPath(candidate.id)}
                className={candidate.id === list?.id ? "selected" : undefined}
                aria-current={candidate.id === list?.id ? "page" : undefined}
              >
                {candidate.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <footer className="info">
        <p>Double-click to edit a todo</p>
        <p>
          Part of <a href="https://todomvc.com">TodoMVC</a>
        </p>
      </footer>
    </>
  );
}
