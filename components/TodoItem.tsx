"use client";

import { useState } from "react";
import type { Todo } from "@/lib/todos";

type Props = {
  todo: Todo;
  editing: boolean;
  onToggle: () => void;
  onTogglePin: () => void;
  onDestroy: () => void;
  onEdit: () => void;
  onSave: (title: string) => void;
  onCancel: () => void;
};

export default function TodoItem({ todo, editing, onToggle, onTogglePin, onDestroy, onEdit, onSave, onCancel }: Props) {
  const [editText, setEditText] = useState(todo.title);

  function startEditing() {
    setEditText(todo.title);
    onEdit();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      onSave(editText);
    } else if (event.key === "Escape") {
      setEditText(todo.title);
      onCancel();
    }
  }

  const classes = [todo.completed ? "completed" : "", todo.pinned ? "pinned" : "", editing ? "editing" : ""].filter(Boolean).join(" ");

  return (
    <li className={classes || undefined}>
      <div className="view">
        <input className="toggle" type="checkbox" checked={todo.completed} onChange={onToggle} />
        <label onDoubleClick={startEditing}>{todo.title}</label>
        <button className="pin" onClick={onTogglePin}>
          {todo.pinned ? "Unpin" : "Pin"}
        </button>
        <button className="destroy" onClick={onDestroy} />
      </div>
      {editing && (
        <input
          className="edit"
          autoFocus
          value={editText}
          onChange={(event) => setEditText(event.target.value)}
          onBlur={() => onSave(editText)}
          onKeyDown={handleKeyDown}
        />
      )}
    </li>
  );
}
