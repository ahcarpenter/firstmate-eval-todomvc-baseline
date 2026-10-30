"use client";

import { useEffect, useRef, useState } from "react";
import type { Todo } from "@/lib/todos";

type Props = {
  todo: Todo;
  editing: boolean;
  onToggle: () => void;
  onDestroy: () => void;
  onEdit: () => void;
  onSave: (title: string) => void;
  onCancel: () => void;
};

export default function TodoItem({ todo, editing, onToggle, onDestroy, onEdit, onSave, onCancel }: Props) {
  const [editText, setEditText] = useState(todo.title);
  const editButton = useRef<HTMLButtonElement>(null);
  // Set once Enter or Escape has finished the edit, so the blur that follows unmounting
  // the field cannot save a second time (or save text the user just cancelled).
  const finished = useRef(false);
  const wasEditing = useRef(editing);

  useEffect(() => {
    // When the edit field goes away while it held focus, focus would fall back to the page;
    // return it to this todo's Edit button so keyboard users keep their place.
    if (wasEditing.current && !editing && (!document.activeElement || document.activeElement === document.body)) {
      editButton.current?.focus();
    }
    wasEditing.current = editing;
  }, [editing]);

  function startEditing() {
    finished.current = false;
    setEditText(todo.title);
    onEdit();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      // Focus moves to the Edit button before this key finishes; without this the same
      // Enter would activate that button and reopen the editor.
      event.preventDefault();
      finished.current = true;
      onSave(editText);
    } else if (event.key === "Escape") {
      finished.current = true;
      setEditText(todo.title);
      onCancel();
    }
  }

  function handleBlur() {
    if (!finished.current) onSave(editText);
  }

  const classes = [todo.completed ? "completed" : "", editing ? "editing" : ""].filter(Boolean).join(" ");

  return (
    <li className={classes || undefined} data-todo-id={todo.id}>
      <div className="view">
        <input
          className="toggle"
          type="checkbox"
          checked={todo.completed}
          onChange={onToggle}
          aria-label={todo.title}
        />
        <label onDoubleClick={startEditing}>{todo.title}</label>
        <button
          ref={editButton}
          type="button"
          className="edit-button"
          onClick={startEditing}
          aria-label={`Edit "${todo.title}"`}
        />
        <button type="button" className="destroy" onClick={onDestroy} aria-label={`Delete "${todo.title}"`} />
      </div>
      {editing && (
        <input
          className="edit"
          autoFocus
          aria-label={`Edit "${todo.title}"`}
          value={editText}
          onChange={(event) => setEditText(event.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      )}
    </li>
  );
}
