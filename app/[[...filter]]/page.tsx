import { notFound } from "next/navigation";
import TodoApp from "@/components/TodoApp";
import { FILTERS, type Filter } from "@/lib/todos";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ filter: [] }, { filter: ["active"] }, { filter: ["completed"] }, { filter: ["overdue"] }];
}

export default async function Page({ params }: { params: Promise<{ filter?: string[] }> }) {
  const { filter } = await params;
  const name = filter?.[0] ?? "all";
  if ((filter && filter.length > 1) || !FILTERS.includes(name as Filter)) {
    notFound();
  }
  return <TodoApp filter={name as Filter} />;
}
