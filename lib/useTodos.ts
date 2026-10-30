"use client";

import { useEffect, useReducer, useState } from "react";
import { todosReducer } from "./todoState";
import { loadTodos, saveTodos } from "./todos";

export function useTodos() {
  const [todos, dispatch] = useReducer(todosReducer, []);
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

  return { todos, dispatch };
}
