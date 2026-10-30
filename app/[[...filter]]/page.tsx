import { notFound } from "next/navigation";
import TodoApp from "@/components/TodoApp";
import { FILTERS, type Filter } from "@/lib/todos";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ filter: [] }, { filter: ["active"] }, { filter: ["completed"] }];
}

export default async function Page({ params }: { params: Promise<{ filter?: string[] }> }) {
  const { filter } = await params;
  const name = filter?.[0] ?? "all";
  if ((filter && filter.length > 1) || !FILTERS.includes(name as Filter)) {
    notFound();
  }
  // With no list in the URL, TodoApp opens the first list.
  return <TodoApp listId={null} filter={name as Filter} />;
}
