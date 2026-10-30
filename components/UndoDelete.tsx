"use client";

import { pluralize, type Todo } from "@/lib/todos";

type Props = {
  todos: Todo[];
  onUndo: () => void;
};

export default function UndoDelete({ todos, onUndo }: Props) {
  return (
    <div className="undo-delete" role="status" style={styles.bar}>
      <span style={styles.message}>
        {todos.length === 1 ? (
          <>Deleted &ldquo;{todos[0].title}&rdquo;</>
        ) : (
          `Deleted ${todos.length} ${pluralize(todos.length, "todo")}`
        )}
      </span>
      <button type="button" onClick={onUndo} style={styles.button}>
        Undo
      </button>
    </div>
  );
}

const styles = {
  bar: {
    position: "fixed",
    left: "50%",
    bottom: 24,
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    gap: 16,
    maxWidth: "calc(100% - 32px)",
    padding: "12px 16px",
    background: "#333",
    color: "#fff",
    borderRadius: 4,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
    fontSize: 16,
  },
  message: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  button: {
    color: "#f5b7b1",
    fontWeight: "bold",
    textTransform: "uppercase",
    cursor: "pointer",
  },
} satisfies Record<string, React.CSSProperties>;
