import { nextId, type Todo } from "./todos";

export type TodoAction =
  | { type: "load"; todos: Todo[] }
  | { type: "add"; title: string }
  | { type: "toggle"; id: number }
  | { type: "toggleAll"; completed: boolean }
  | { type: "destroy"; id: number }
  | { type: "save"; id: number; title: string }
  | { type: "clearCompleted" };

export function todoReducer(todos: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case "load":
      return action.todos;
    case "add": {
      const title = action.title.trim();
      if (!title) return todos;
      return [...todos, { id: nextId(todos), title, completed: false }];
    }
    case "toggle":
      return todos.map((todo) => (todo.id === action.id ? { ...todo, completed: !todo.completed } : todo));
    case "toggleAll":
      return todos.map((todo) => ({ ...todo, completed: action.completed }));
    case "destroy":
      return todos.filter((todo) => todo.id !== action.id);
    case "save": {
      const title = action.title.trim();
      if (!title) return todos.filter((todo) => todo.id !== action.id);
      return todos.map((todo) => (todo.id === action.id ? { ...todo, title } : todo));
    }
    case "clearCompleted":
      return todos.filter((todo) => !todo.completed);
  }
}
