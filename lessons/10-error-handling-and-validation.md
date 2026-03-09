# Lesson 10: Error Handling and Validation

## Goal

Add **validation** for mutation inputs (required fields, length limits) and use **GraphQL errors** so the client gets clear, safe messages. Use Apollo’s **UserInputError** for validation and “not found” cases, and optionally **formatError** on the server to log only unexpected errors.

## Why validate on the server?

The schema enforces types (e.g. `String!`), but it doesn’t enforce “non-empty” or “max length”. If you only validate in the client, a direct API call can still send invalid data. Server-side validation keeps the API consistent and returns a single place for error messages.

## Throwing in resolvers

When a resolver **throws**, Apollo Server catches it and turns it into a **GraphQL error**: the response still has HTTP 200, but the `errors` array is filled and the corresponding field (e.g. `createUser` or `publishPost`) is null. The client can read `errors[0].message` (and optional `extensions.code`) to show a message.

- **Nullable field** (e.g. `post(id: ID!): Post`) – You can either **return null** for “not found” or **throw**. Returning null is simple and keeps “not found” out of the errors array; throwing makes “not found” a first-class error.
- **Non-nullable field** (e.g. `createUser(...): User!`) – You **must** return a value. To signal failure, **throw**; otherwise the server would have to return null and would report “Cannot return null for non-nullable field.”

So for mutations that must succeed or fail clearly, we **throw** and use a dedicated error type for “bad input.”

## UserInputError-style errors

**User-input errors** are for **client-caused** problems: invalid or missing arguments, “user not found,” etc. They use `extensions.code: 'BAD_USER_INPUT'` so the client (and **formatError**) can treat them as validation errors. You can pass an **argumentName** so the client can highlight the right field.

Apollo Server 4 does not export **UserInputError** from `@apollo/server/errors`; this project uses a small helper in **server/errors.js** that throws a **GraphQLError** with that code. The effect is the same.

```js
import { UserInputError } from '../errors.js';

if (!title?.trim()) {
  throw UserInputError('Title is required.', { argumentName: 'title' });
}
```

Use this pattern for:

- Required-but-empty strings (after trim).
- Length limits (e.g. title max 200 characters).
- Business rules (e.g. “user not found” for `authorUsername`).

Use a plain **Error** or **GraphQLError** for unexpected server failures; those can be logged and not exposed in full to the client.

## Validation in this project

- **createUser(username, displayName)** – Both required (non-empty after trim). Max lengths: username 50, displayName 100. On failure we throw **UserInputError** with a short message and optional **argumentName**.
- **publishPost(title, body, authorUsername)** – Title and body required and trimmed; max lengths 200 and 10_000. Author username required. If the user doesn’t exist, we throw **UserInputError** with a “User not found” message and **argumentName: 'authorUsername'**.

Validation runs at the start of the resolver; on success we pass the **validated** (trimmed) values to the DB.

## formatError (optional)

In **ApolloServer** you can pass **formatError(formattedError, error)**. It receives every error before it’s sent to the client. Use it to:

- **Log** only unexpected errors (e.g. skip logging when `error.extensions.code === 'BAD_USER_INPUT'`).
- **Sanitize** messages (e.g. hide internal details in production).

In this project we log to the console only when the error is **not** `BAD_USER_INPUT`, so validation errors don’t clutter the logs.

## Client: reading errors

GraphQL responses can have both **data** and **errors**. For mutations, if the resolver throws, the mutation field is null and **errors** is non-empty. Apollo Client puts these in **error.graphQLErrors**; **error.message** is often the first error’s message.

In the React app we use a small helper **getErrorMessage(err)** that returns **err.graphQLErrors[0].message** when present, otherwise **err.message** (or a fallback). We use it for both **createUser** and **publishPost** so validation and “user not found” messages from the server show up in the UI. We also surface **createUserError** from **useMutation** so server validation errors for “Set as current user” are displayed.

## Summary

| Concept | Role |
|--------|------|
| **Throw in resolvers** | Produces a GraphQL error; the field is null, the client gets **errors[].message**. |
| **User-input errors** | Throw a **GraphQLError** with **extensions.code: BAD_USER_INPUT** (e.g. via **UserInputError** in **server/errors.js**); optional **argumentName**. |
| **Validation** | Check required, trim, length (and business rules) in the resolver; throw **UserInputError** with a clear message. |
| **formatError** | Optional hook to log or sanitize errors before sending; skip logging for **BAD_USER_INPUT**. |
| **Client** | Use **error.graphQLErrors** or **error.message** and show one message in the UI. |

## How to test these errors

### 1. In the React app (manual)

- **createUser** – Leave username or display name empty, or set display name longer than 100 characters; submit. You should see the server message in the header (e.g. “Username is required.”).
- **publishPost** – Leave title or body empty; or set a current user, then change/remove that user in the DB (or use a username that doesn’t exist) and publish. You should see “User not found: …” or “Title is required.” etc.

### 2. In Apollo Sandbox or any GraphQL client (manual)

Open **http://localhost:4000/graphql** (or your client’s URL) and run mutations with invalid input. The response will have **errors** and no **data** for the mutation:

**createUser – empty username:**

```graphql
mutation {
  createUser(username: "", displayName: "A User") {
    id
    username
  }
}
```

Expect **errors[0].message** like `"Username is required."` and **extensions.code**: `"BAD_USER_INPUT"`.

**publishPost – user not found:**

```graphql
mutation {
  publishPost(title: "Hi", body: "Body", authorUsername: "nonexistent") {
    id
    title
  }
}
```

Expect **errors[0].message** like `"User not found: nonexistent. Create the user first with createUser."`.

### 3. Automated script (optional)

From the **server** directory, with the server running, you can run a small script that sends these requests and checks the error messages. See **server/test-errors.js** and run:

```bash
cd server && node test-errors.js
```

This helps confirm that validation and error codes stay correct after changes.
