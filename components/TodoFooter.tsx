import Link from "next/link";
import { pluralize, type Filter } from "@/lib/todos";

type Props = {
  filter: Filter;
  activeCount: number;
  completedCount: number;
  onClearCompleted: () => void;
};

export default function TodoFooter({ filter, activeCount, completedCount, onClearCompleted }: Props) {
  return (
    <footer className="footer">
      <span className="todo-count">
        <strong>{activeCount}</strong> {pluralize(activeCount, "item")} left
      </span>
      <ul className="filters">
        <li>
          <Link href="/" className={filter === "all" ? "selected" : undefined}>
            All
          </Link>
        </li>
        <li>
          <Link href="/active" className={filter === "active" ? "selected" : undefined}>
            Active
          </Link>
        </li>
        <li>
          <Link href="/completed" className={filter === "completed" ? "selected" : undefined}>
            Completed
          </Link>
        </li>
      </ul>
      {completedCount > 0 && (
        <button className="clear-completed" onClick={onClearCompleted}>
          Clear completed
        </button>
      )}
    </footer>
  );
}
