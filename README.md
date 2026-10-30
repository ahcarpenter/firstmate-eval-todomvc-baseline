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

- `app/lists/[id]/[[...filter]]/page.tsx` serves `/lists/<id>`, `/lists/<id>/active`, and `/lists/<id>/completed`.
- `app/[[...filter]]/page.tsx` sends `/`, `/active`, and `/completed` to the first list.
- `components/TodoApp.tsx` holds the lists state, persistence, and the page UI.
- `components/TodoItem.tsx` renders one todo and its edit field.
- `lib/todos.ts` has the `Todo` and `TodoList` types, filtering, and localStorage helpers.

Lists persist in `localStorage` under the `todos-nextjs-lists` key.
Todos saved under the older `todos-nextjs` key are read into a list called "Todos" when no lists are stored yet.
