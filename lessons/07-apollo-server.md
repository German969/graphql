# Lesson 7: Apollo Server

## Goal

Replace **express-graphql** with **Apollo Server** on the backend. The API stays the same (same schema, same resolvers); only the server runtime changes. You’ll see how Apollo Server uses **typeDefs** and a **resolvers** map and plugs into Express with **expressMiddleware**.

## What is Apollo Server?

**Apollo Server** is a GraphQL server library that:

- Runs your schema and resolvers (like express-graphql + graphql-js).
- Integrates with Express, Fastify, and others via official integrations.
- Supports **context** (e.g. auth, db) and **plugins** (logging, caching).
- Can expose **Apollo Studio** and **sandbox** for exploring the API.

We keep the same **schema** (our `server/schema/*.graphql` files) and the same **resolver logic** (blog, user, post); we only change how they are wired to Express.

## From express-graphql to Apollo Server

**Before (express-graphql):**

- We built a **schema** with `buildSchema(schemaString)` and passed a **rootValue** (flat object of resolver functions).
- **graphqlHTTP** handled POST requests and ran the GraphQL pipeline.

**With Apollo Server:**

- We pass **typeDefs** (the schema as a string) and **resolvers** (a map by type: `Query`, `Mutation`, etc.).
- Apollo builds the executable schema and runs it. We use **expressMiddleware** from **@as-integrations/express4** to mount it on Express.

So we reuse our schema string and reshape our existing resolvers into Apollo’s **Query** / **Mutation** structure.

## Setup

**1. Dependencies**

- Add **@apollo/server**, **@as-integrations/express4**, and **cors**.
- Remove **express-graphql** (we no longer use it).
- Keep **express**, **graphql**, and **better-sqlite3**.

**2. Schema: export typeDefs**

In **`server/schema.js`** we already read and concatenate **`server/schema/*.graphql`**. We export that string as **typeDefs** for Apollo (and can keep exporting **schema** from **buildSchema** if something else needs it). Apollo only needs **typeDefs**.

**3. Resolvers: Apollo shape**

Apollo expects resolvers grouped by type:

```js
{
  Query: {
    blogName: () => '...',
    serverTime: () => '...',
    user: (_, { username }) => getUserByUsername(username),
    posts: () => getAllPosts(),
  },
  Mutation: {
    createUser: (_, { username, displayName }) => createUserInDb(username, displayName),
    publishPost: (_, { title, body, authorUsername }) => insertPost(...),
  },
}
```

Our existing **resolvers** (blog, user, post) are flat. We build the Apollo **resolvers** object by mapping them into **Query** and **Mutation**. Resolver functions are called with **(parent, args, context, info)**. For root fields, **parent** is the root (often unused), and **args** holds the operation arguments. So we use **(_, { title, body, authorUsername })** for **publishPost** and **(_, { username })** for **user**, etc.—the first parameter is the parent, the second is the arguments.

**4. Server entry: async start**

Apollo Server must be **started** before handling requests:

```js
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express4'
import express from 'express'
import cors from 'cors'
import { typeDefs } from './schema.js'
import { resolvers } from './resolvers/index.js'

const server = new ApolloServer({ typeDefs, resolvers })
await server.start()

const app = express()
app.use('/graphql', cors(), express.json(), expressMiddleware(server))
app.listen(4000, () => console.log('Server at http://localhost:4000/graphql'))
```

We use **cors()** and **express.json()** so the client can send JSON and the browser is happy with cross-origin. **expressMiddleware(server)** handles POST requests to **/graphql** and runs the GraphQL pipeline.

**5. GraphQL playground**

Apollo Server 4 can serve a **sandbox** (or **Apollo Sandbox**) for exploring the API. By default, GET requests to the GraphQL URL might show a landing page depending on configuration; we keep the same **/graphql** endpoint so the existing frontend and GraphiQL-style usage still work. If you want a built-in UI, you can enable **sandbox** or **playground** in the Apollo Server options.

## What we changed

- **package.json** – Replaced **express-graphql** with **@apollo/server**, **@as-integrations/express4**, and **cors**.
- **schema.js** – Export **typeDefs** (schema string) for Apollo.
- **resolvers/index.js** – Export an Apollo-shaped **resolvers** object: **Query** (blogName, serverTime, user, posts) and **Mutation** (createUser, publishPost), using the same functions from blog, user, and post resolvers.
- **index.js** – Create **ApolloServer({ typeDefs, resolvers })**, **await server.start()**, then **app.use('/graphql', cors(), express.json(), expressMiddleware(server))**. No more **graphqlHTTP**.

The API contract (schema and behavior) is unchanged; only the server implementation is Apollo-based.

## Takeaways

| Concept | Role |
|--------|------|
| **Apollo Server** | GraphQL server that runs schema + resolvers and plugs into Express (or other frameworks). |
| **typeDefs** | Schema as string (or document). We keep our concatenated **server/schema/*.graphql**. |
| **resolvers** | Map by type: **Query**, **Mutation**, and optionally **User**, **Post** if we add field-level resolvers later. |
| **expressMiddleware** | Mounts Apollo Server on Express; use with **cors()** and **express.json()**. |
| **server.start()** | Must **await** before attaching middleware; Apollo Server 4 requirement. |

**Note:** This course uses **Apollo Server 4**. Apollo has released v5; when you’re ready, you can follow their migration guide. The concepts (typeDefs, resolvers, expressMiddleware) carry over.

Next steps could be: **context** (inject db or auth into resolvers), **plugins**, or **subscriptions** with Apollo Server.
