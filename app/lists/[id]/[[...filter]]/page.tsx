import { notFound } from "next/navigation";
import TodoApp from "@/components/TodoApp";
import { FILTERS, type Filter } from "@/lib/todos";

export default async function Page({ params }: { params: Promise<{ id: string; filter?: string[] }> }) {
  const { id, filter } = await params;
  // "all" is the bare list URL, so it is not accepted as a segment.
  const segment = filter?.[0];
  if (filter && (filter.length > 1 || segment === "all" || !FILTERS.includes(segment as Filter))) {
    notFound();
  }
  return <TodoApp listId={id} filter={(segment ?? "all") as Filter} />;
}
