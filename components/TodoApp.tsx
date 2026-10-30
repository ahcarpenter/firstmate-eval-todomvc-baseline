"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TodoItem from "@/components/TodoItem";
import { addList, loadLists, removeList, renameList, replaceTodos, saveLists, type TodoList } from "@/lib/lists";
import { filterTodos, nextId, pluralize, type Filter, type Todo } from "@/lib/todos";

const ENTER_KEY = "Enter";
const ESCAPE_KEY = "Escape";

// Without a listId the app shows the first list, which is what `/` opens.
export default function TodoApp({ listId, filter }: { listId?: string; filter: Filter }) {
  const router = useRouter();
  const [lists, setLists] = useState<TodoList[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newListName, setNewListName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [renamingListId, setRenamingListId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState("");
  // The open list's id after it is deleted, so the page shows the first list instead of
  // not found until the switch to that list lands.
  const [deletedOpenListId, setDeletedOpenListId] = useState<string | null>(null);

  useEffect(() => {
    // Read storage after mount so the server render and the first client render match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLists(loadLists());
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  const list =
    (listId === undefined ? lists[0] : lists.find((candidate) => candidate.id === listId)) ??
    (listId === deletedOpenListId ? lists[0] : notFound());
  const todos = list.todos;
  const listPath = `/lists/${list.id}`;

  // Save as part of every change so a page opened right after (a new list) reads it.
  function updateLists(next: TodoList[]) {
    setLists(next);
    saveLists(next);
  }

  function setTodos(next: Todo[]) {
    updateLists(replaceTodos(lists, list.id, next));
  }

  function createList(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== ENTER_KEY) return;
    const name = newListName.trim();
    if (!name) return;
    const [next, created] = addList(lists, name);
    updateLists(next);
    setNewListName("");
    router.push(`/lists/${created.id}`);
  }

  function startRenaming(target: TodoList) {
    setRenameText(target.name);
    setRenamingListId(target.id);
  }

  function handleRenameKeyDown(event: React.KeyboardEvent<HTMLInputElement>, id: string) {
    if (event.key === ESCAPE_KEY) {
      setRenamingListId(null);
      return;
    }
    if (event.key !== ENTER_KEY) return;
    const name = renameText.trim();
    if (!name) return;
    updateLists(renameList(lists, id, name));
    setRenamingListId(null);
  }

  function deleteList(target: TodoList) {
    if (lists.length <= 1) return;
    if (!window.confirm(`Delete the list "${target.name}" and its todos?`)) return;
    const next = removeList(lists, target.id);
    updateLists(next);
    if (target.id === list.id && listId !== undefined) {
      setDeletedOpenListId(target.id);
      router.replace(`/lists/${next[0].id}`);
    }
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
                <Link href={listPath} className={filter === "all" ? "selected" : undefined}>
                  All
                </Link>
              </li>
              <li>
                <Link href={`${listPath}/active`} className={filter === "active" ? "selected" : undefined}>
                  Active
                </Link>
              </li>
              <li>
                <Link href={`${listPath}/completed`} className={filter === "completed" ? "selected" : undefined}>
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
      <nav className="lists" aria-label="Lists">
        <ul>
          {lists.map((candidate) => (
            <li key={candidate.id}>
              {renamingListId === candidate.id ? (
                <input
                  className="rename-list"
                  aria-label={`New name for ${candidate.name}`}
                  autoFocus
                  value={renameText}
                  onChange={(event) => setRenameText(event.target.value)}
                  onKeyDown={(event) => handleRenameKeyDown(event, candidate.id)}
                  onBlur={() => setRenamingListId(null)}
                />
              ) : (
                <Link
                  href={`/lists/${candidate.id}`}
                  className={candidate.id === list.id ? "selected" : undefined}
                  aria-current={candidate.id === list.id ? "page" : undefined}
                >
                  {candidate.name}
                </Link>
              )}
              <button className="rename-list-button" onClick={() => startRenaming(candidate)}>
                Rename {candidate.name}
              </button>
              <button
                className="delete-list-button"
                onClick={() => deleteList(candidate)}
                disabled={lists.length <= 1}
                title={lists.length <= 1 ? "The last list cannot be deleted" : undefined}
              >
                Delete {candidate.name}
              </button>
            </li>
          ))}
        </ul>
        <label htmlFor="new-list">New list name</label>
        <input
          id="new-list"
          className="new-list"
          value={newListName}
          onChange={(event) => setNewListName(event.target.value)}
          onKeyDown={createList}
        />
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
