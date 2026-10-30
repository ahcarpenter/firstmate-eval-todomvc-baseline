import { notFound } from "next/navigation";
import OpenFirstList from "@/components/OpenFirstList";
import { FILTERS, type Filter } from "@/lib/todos";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ filter: [] }, { filter: ["active"] }, { filter: ["completed"] }];
}

// Lists live in the browser, so the first list is only known on the client.
export default async function Page({ params }: { params: Promise<{ filter?: string[] }> }) {
  const { filter } = await params;
  const name = filter?.[0] ?? "all";
  if ((filter && filter.length > 1) || !FILTERS.includes(name as Filter)) {
    notFound();
  }
  return <OpenFirstList filter={name as Filter} />;
}
