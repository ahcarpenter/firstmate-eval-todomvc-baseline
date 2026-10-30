# TodoMVC in Next.js

A [TodoMVC](https://todomvc.com/) implementation with the Next.js App Router and TypeScript.

## Develop

```sh
npm install
npm run dev
```

Open http://localhost:3000.

## Checks

```sh
npm run lint
npm run typecheck
npm test          # unit tests (Vitest)
npm run test:e2e  # end-to-end tests (Playwright); builds and starts the app on port 3100
```

## Layout

- `app/[[...filter]]/page.tsx` serves `/`, `/active`, and `/completed`.
- `components/TodoApp.tsx` renders the page and holds the new-todo and editing UI state.
- `components/TodoItem.tsx` renders one todo and its edit field.
- `components/TodoFooter.tsx` renders the item count, filter links, and Clear completed.
- `hooks/useTodos.ts` holds the list state and loads and saves it to localStorage.
- `lib/todoReducer.ts` is the pure reducer for every list change; unit tested in `lib/todoReducer.test.ts`.
- `lib/todos.ts` has the `Todo` type, filtering, and localStorage helpers.

Todos persist in `localStorage` under the `todos-nextjs` key.
