# Learn GraphQL the Hard Way

A step-by-step GraphQL project with **Node (Express)** and **React**. Each lesson adds one concept and is documented in `lessons/`.

We use a **blog** example so names are clear and real-world: **`blogName`**, **`serverTime`**, **`posts`** (list of **`Post`** with `id`, `title`, `body`, `publishedAt`), and a **`publishPost`** mutation to create posts.

## Setup

### Backend (GraphQL API)

```bash
cd server
npm install
npm run dev
```

- API: **http://localhost:4000/graphql**
- GraphiQL (playground): open that URL in the browser

### Frontend (React)

```bash
cd client
npm install
npm run dev
```

- App: **http://localhost:5173** (or the port Vite prints)

## Lessons

| Lesson | Topic | Path |
|--------|--------|------|
| 1 | Schema and resolvers | [01-schema-and-resolvers.md](lessons/01-schema-and-resolvers.md) |
| 2 | First query from React | [02-first-client-query.md](lessons/02-first-client-query.md) |
| 3 | Mutations | [03-mutations.md](lessons/03-mutations.md) |
| 4 | Variables and fragments | [04-variables-and-fragments.md](lessons/04-variables-and-fragments.md) |

Run the server before the client when doing the lessons.

## Editor

- **GraphQL extension** – `.graphqlrc.yml` points the extension at `server/schema.graphql` and at `client/src` for documents, so you get schema-aware validation and autocomplete. Lesson 1 describes this in more detail.
- **Syntax highlighting for `.graphql`** – The workspace recommends **GraphQL: Syntax Highlighting** (`GraphQL.vscode-graphql-syntax`). If `.graphql` files don’t highlight, install that extension; `.vscode/settings.json` associates `*.graphql`, `*.gql`, and `*.graphqls` with the GraphQL language.
