import { notFound } from "next/navigation";
import TodoApp from "@/components/TodoApp";
import { FILTERS, type Filter } from "@/lib/todos";

export default async function Page({ params }: { params: Promise<{ id: string; filter?: string[] }> }) {
  const { id, filter } = await params;
  const name = filter?.[0] ?? "all";
  if ((filter && filter.length > 1) || !FILTERS.includes(name as Filter)) {
    notFound();
  }
  return <TodoApp listId={id} filter={name as Filter} />;
}
