"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ListLink from "@/components/ListLink";
import TodoItem from "@/components/TodoItem";
import {
  deleteList,
  filterTodos,
  listPath,
  loadLists,
  nextId,
  pluralize,
  renameList,
  saveLists,
  type Filter,
  type Todo,
  type TodoList,
} from "@/lib/todos";

const ENTER_KEY = "Enter";

export default function TodoApp({ listId, filter }: { listId: string; filter: Filter }) {
  const router = useRouter();
  const [lists, setLists] = useState<TodoList[] | null>(null);
  const [newListName, setNewListName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    // Read storage after mount so the server render and the first client render match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLists(loadLists());
  }, []);

  const list = lists?.find((candidate) => String(candidate.id) === listId);
  const todos = list?.todos ?? [];

  // Save on every change rather than in an effect, so a list created just before
  // navigating to it is already stored when the next page reads storage.
  function commitLists(next: TodoList[]) {
    setLists(next);
    saveLists(next);
  }

  function setTodos(next: Todo[]) {
    if (!lists || !list) return;
    commitLists(lists.map((candidate) => (candidate.id === list.id ? { ...candidate, todos: next } : candidate)));
  }

  function addList(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== ENTER_KEY || !lists) return;
    const name = newListName.trim();
    if (!name) return;
    const created = { id: nextId(lists), name, todos: [] };
    commitLists([...lists, created]);
    setNewListName("");
    router.push(listPath(created.id));
  }

  function rename(target: TodoList, name: string) {
    if (!lists) return;
    commitLists(renameList(lists, target.id, name));
  }

  function remove(target: TodoList) {
    if (!lists || lists.length <= 1) return;
    if (!window.confirm(`Delete the list "${target.name}" and its todos?`)) return;
    const next = deleteList(lists, target.id);
    commitLists(next);
    if (target === list) router.replace(listPath(next[0].id));
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

  const listsNav = lists && (
    <nav className="lists" aria-label="Lists">
      <ul>
        {lists.map((candidate) => (
          <ListLink
            key={candidate.id}
            list={candidate}
            current={candidate === list}
            canDelete={lists.length > 1}
            onRename={(name) => rename(candidate, name)}
            onDelete={() => remove(candidate)}
          />
        ))}
      </ul>
      <label htmlFor="new-list">New list name</label>
      <input
        id="new-list"
        className="new-list"
        value={newListName}
        onChange={(event) => setNewListName(event.target.value)}
        onKeyDown={addList}
      />
    </nav>
  );

  if (lists && !list) {
    return (
      <>
        {listsNav}
        <section className="todoapp">
          <p className="missing-list">This list does not exist.</p>
        </section>
      </>
    );
  }

  return (
    <>
      {listsNav}
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
                <Link href={listPath(listId)} className={filter === "all" ? "selected" : undefined}>
                  All
                </Link>
              </li>
              <li>
                <Link href={listPath(listId, "active")} className={filter === "active" ? "selected" : undefined}>
                  Active
                </Link>
              </li>
              <li>
                <Link href={listPath(listId, "completed")} className={filter === "completed" ? "selected" : undefined}>
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
        <p>Double-click to edit a todo</p>
        <p>
          Part of <a href="https://todomvc.com">TodoMVC</a>
        </p>
      </footer>
    </>
  );
}
