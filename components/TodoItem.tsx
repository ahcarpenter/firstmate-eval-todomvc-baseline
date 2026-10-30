"use client";

import { useRef, useState } from "react";
import { formatDue, type Todo } from "@/lib/todos";

type Props = {
  todo: Todo;
  today: string;
  overdue: boolean;
  editing: boolean;
  onToggle: () => void;
  onDestroy: () => void;
  onEdit: () => void;
  onSave: (title: string, due: string) => void;
  onCancel: () => void;
};

export default function TodoItem({ todo, today, overdue, editing, onToggle, onDestroy, onEdit, onSave, onCancel }: Props) {
  const [editText, setEditText] = useState(todo.title);
  const [editDue, setEditDue] = useState(todo.due ?? "");
  // Set once Enter or Escape ends the edit, so the blur from unmounting the fields does not save again.
  const finished = useRef(false);

  function startEditing() {
    setEditText(todo.title);
    setEditDue(todo.due ?? "");
    finished.current = false;
    onEdit();
  }

  function finish(save: boolean) {
    if (finished.current) return;
    finished.current = true;
    if (save) onSave(editText, editDue);
    else onCancel();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") finish(true);
    else if (event.key === "Escape") finish(false);
  }

  function handleBlur(event: React.FocusEvent<HTMLDivElement>) {
    // Moving between the title and date fields keeps the edit open.
    if (event.currentTarget.contains(event.relatedTarget)) return;
    finish(true);
  }

  const due = todo.due ? formatDue(todo.due, today) : null;
  const classes = [todo.completed ? "completed" : "", editing ? "editing" : ""].filter(Boolean).join(" ");

  return (
    <li className={classes || undefined}>
      <div className="view">
        <input className="toggle" type="checkbox" checked={todo.completed} onChange={onToggle} />
        <label onDoubleClick={startEditing}>{todo.title}</label>
        {due && <span className="todo-due">{due}</span>}
        {overdue && <span className="todo-overdue">Overdue</span>}
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
          <label className="edit-due">
            Change date
            <input type="date" value={editDue} onChange={(event) => setEditDue(event.target.value)} onKeyDown={handleKeyDown} />
          </label>
        </div>
      )}
    </li>
  );
}
