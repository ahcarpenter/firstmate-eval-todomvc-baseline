"use client";

import { useEffect, useRef, useState } from "react";
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

export default function TodoItem({ todo, editing, onToggle, onToggleImportant, onDestroy, onEdit, onSave, onCancel }: Props) {
  const [editText, setEditText] = useState(todo.title);
  const editButton = useRef<HTMLButtonElement>(null);
  // Set when editing ends from the keyboard, so focus returns to the item instead of the page body.
  const restoreFocus = useRef(false);
  const labelId = `todo-label-${todo.id}`;

  useEffect(() => {
    if (!editing && restoreFocus.current) {
      restoreFocus.current = false;
      editButton.current?.focus();
    }
  }, [editing]);

  function startEditing() {
    setEditText(todo.title);
    onEdit();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      // Focus moves to the edit button before this key press finishes; don't let it click the button too.
      event.preventDefault();
      restoreFocus.current = true;
      onSave(editText);
    } else if (event.key === "Escape") {
      restoreFocus.current = true;
      setEditText(todo.title);
      onCancel();
    }
  }

  function handleBlur() {
    // Enter and Escape already ended editing; the blur from unmounting the field must not save again.
    if (!restoreFocus.current) onSave(editText);
  }

  const classes = [todo.completed ? "completed" : "", todo.important ? "important" : "", editing ? "editing" : ""].filter(Boolean).join(" ");

  return (
    <li className={classes || undefined}>
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
        <button
          type="button"
          className="important-button"
          onClick={onToggleImportant}
          aria-label="Important"
          aria-pressed={todo.important}
        />
        <button ref={editButton} type="button" className="edit-button" onClick={startEditing} aria-label={`Edit ${todo.title}`} />
        <button type="button" className="destroy" onClick={onDestroy} aria-label={`Delete ${todo.title}`} />
      </div>
      {editing && (
        <input
          className="edit"
          autoFocus
          aria-label={`Edit ${todo.title}`}
          value={editText}
          onChange={(event) => setEditText(event.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      )}
    </li>
  );
}
