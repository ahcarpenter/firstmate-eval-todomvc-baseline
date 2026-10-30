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
- `components/TodoApp.tsx` holds the list state, persistence, and the page UI.
- `components/TodoItem.tsx` renders one todo, its Duplicate and delete buttons, and its edit field.
- `lib/todos.ts` has the `Todo` type, filtering, and localStorage helpers.

Todos persist in `localStorage` under the `todos-nextjs` key.
