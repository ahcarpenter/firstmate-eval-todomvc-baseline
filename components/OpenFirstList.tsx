"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { listPath, loadLists, saveLists, type Filter } from "@/lib/todos";

export default function OpenFirstList({ filter }: { filter: Filter }) {
  const router = useRouter();

  useEffect(() => {
    const lists = loadLists();
    // Store the lists so todos saved before lists existed are migrated once.
    saveLists(lists);
    router.replace(listPath(lists[0].id, filter));
  }, [router, filter]);

  return null;
}
