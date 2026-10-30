"use client";

import Link from "next/link";
import { useState } from "react";
import { listPath, type TodoList } from "@/lib/todos";

type Props = {
  list: TodoList;
  current: boolean;
  canDelete: boolean;
  onRename: (name: string) => void;
  onDelete: () => void;
};

export default function ListLink({ list, current, canDelete, onRename, onDelete }: Props) {
  const [renaming, setRenaming] = useState(false);
  const [renameText, setRenameText] = useState(list.name);

  function startRenaming() {
    setRenameText(list.name);
    setRenaming(true);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      const name = renameText.trim();
      if (name) onRename(name);
      setRenaming(false);
    } else if (event.key === "Escape") {
      setRenaming(false);
    }
  }

  if (renaming) {
    return (
      <li>
        <input
          className="rename-list"
          aria-label={`Rename ${list.name}`}
          autoFocus
          value={renameText}
          onChange={(event) => setRenameText(event.target.value)}
          onBlur={() => setRenaming(false)}
          onKeyDown={handleKeyDown}
        />
      </li>
    );
  }

  return (
    <li>
      <Link
        href={listPath(list.id)}
        className={current ? "selected" : undefined}
        aria-current={current ? "page" : undefined}
      >
        {list.name}
      </Link>
      <button className="list-action" onClick={startRenaming}>
        Rename {list.name}
      </button>
      <button className="list-action" onClick={onDelete} disabled={!canDelete}>
        Delete {list.name}
      </button>
    </li>
  );
}
