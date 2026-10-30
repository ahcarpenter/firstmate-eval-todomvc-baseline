"use client";

import { useEffect, useReducer, useState } from "react";
import { todoReducer } from "@/lib/todoReducer";
import { loadTodos, saveTodos } from "@/lib/todos";

export function useTodos() {
  const [todos, dispatch] = useReducer(todoReducer, []);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Read storage after mount so the server render and the first client render match.
    dispatch({ type: "load", todos: loadTodos() });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveTodos(todos);
  }, [todos, loaded]);

  return [todos, dispatch] as const;
}
