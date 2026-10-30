"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Todo } from "@/lib/todos";

type Props = {
  todo: Todo;
  editing: boolean;
  onToggle: () => void;
  onToggleImportant: () => void;
  onDestroy: () => void;
  onEdit: () => void;
  onSave: (title: string) => void;
  onCancel: () => void;
};

export default function TodoItem({
  todo,
  editing,
  onToggle,
  onToggleImportant,
  onDestroy,
  onEdit,
  onSave,
  onCancel,
}: Props) {
  const [editText, setEditText] = useState(todo.title);
  const labelId = useId();
  const editButton = useRef<HTMLButtonElement>(null);
  // Set when Enter or Escape ends the edit, so focus returns to the Edit button
  // and the blur that follows does not save a second time.
  const finishedByKey = useRef(false);

  useEffect(() => {
    if (!editing && finishedByKey.current) {
      finishedByKey.current = false;
      editButton.current?.focus();
    }
  }, [editing]);

  function startEditing() {
    setEditText(todo.title);
    onEdit();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      // Focus moves to the Edit button before the key finishes; without this the
      // same Enter would activate that button and reopen the editor.
      event.preventDefault();
      finishedByKey.current = true;
      onSave(editText);
    } else if (event.key === "Escape") {
      finishedByKey.current = true;
      setEditText(todo.title);
      onCancel();
    }
  }

  function handleBlur() {
    if (!finishedByKey.current) onSave(editText);
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
          aria-labelledby={labelId}
        />
        <label id={labelId} onDoubleClick={startEditing}>
          {todo.title}
        </label>
        <button ref={editButton} className="edit-button" onClick={startEditing} aria-label={`Edit "${todo.title}"`} />
        <button className="destroy" onClick={onDestroy} aria-label={`Delete "${todo.title}"`} />
        <button
          className="star"
          onClick={onToggleImportant}
          aria-label={`Important "${todo.title}"`}
          aria-pressed={todo.important}
        />
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
