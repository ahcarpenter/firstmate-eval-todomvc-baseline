"use client";

import { useState } from "react";
import { formatDue, type Todo } from "@/lib/todos";

type Props = {
  todo: Todo;
  editing: boolean;
  overdue: boolean;
  onToggle: () => void;
  onDestroy: () => void;
  onSnooze: () => void;
  onEdit: () => void;
  onSave: (title: string) => void;
  onCancel: () => void;
};

export default function TodoItem({ todo, editing, overdue, onToggle, onDestroy, onSnooze, onEdit, onSave, onCancel }: Props) {
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

  const due = formatDue(todo.due);
  const classes = [todo.completed ? "completed" : "", editing ? "editing" : ""].filter(Boolean).join(" ");

  return (
    <li className={classes || undefined}>
      <div className="view">
        <input className="toggle" type="checkbox" checked={todo.completed} onChange={onToggle} />
        <label onDoubleClick={startEditing}>
          {todo.title}
          {due && <span className="due">{due}</span>}
          {overdue && <span className="overdue">Overdue</span>}
        </label>
        {overdue && (
          <button className="snooze" onClick={onSnooze}>
            Snooze
          </button>
        )}
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
