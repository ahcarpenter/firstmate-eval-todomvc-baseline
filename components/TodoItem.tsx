"use client";

import { useState } from "react";
import { formatDueDate, type Todo } from "@/lib/todos";

type Props = {
  todo: Todo;
  overdue: boolean;
  editing: boolean;
  onToggle: () => void;
  onDestroy: () => void;
  onEdit: () => void;
  onSave: (title: string, dueDate: string) => void;
  onCancel: () => void;
};

export default function TodoItem({ todo, overdue, editing, onToggle, onDestroy, onEdit, onSave, onCancel }: Props) {
  const [editText, setEditText] = useState(todo.title);
  const [editDueDate, setEditDueDate] = useState(todo.dueDate ?? "");

  function startEditing() {
    setEditText(todo.title);
    setEditDueDate(todo.dueDate ?? "");
    onEdit();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      onSave(editText, editDueDate);
    } else if (event.key === "Escape") {
      setEditText(todo.title);
      setEditDueDate(todo.dueDate ?? "");
      onCancel();
    }
  }

  // Save when focus leaves the edit row, but not when it moves between its fields.
  function handleBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) onSave(editText, editDueDate);
  }

  const classes = [todo.completed ? "completed" : "", editing ? "editing" : ""].filter(Boolean).join(" ");

  return (
    <li className={classes || undefined}>
      <div className="view">
        <input className="toggle" type="checkbox" checked={todo.completed} onChange={onToggle} />
        <label onDoubleClick={startEditing}>
          {todo.title}
          {todo.dueDate && <span className="due-date">{formatDueDate(todo.dueDate)}</span>}
          {overdue && <span className="overdue">Overdue</span>}
        </label>
        <button className="destroy" onClick={onDestroy} />
      </div>
      {editing && (
        <div className="edit-row" onBlur={handleBlur}>
          <input
            className="edit"
            autoFocus
            value={editText}
            onChange={(event) => setEditText(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <label className="edit-due-date">
            Change date
            <input
              type="date"
              value={editDueDate}
              onChange={(event) => setEditDueDate(event.target.value)}
              onKeyDown={handleKeyDown}
            />
          </label>
        </div>
      )}
    </li>
  );
}
