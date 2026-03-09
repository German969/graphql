/**
 * Quick script to test validation and error responses.
 * Run with: node test-errors.js
 * Requires the GraphQL server to be running on http://localhost:4000/graphql
 */

const GRAPHQL_URL = 'http://localhost:4000/graphql';

async function graphql(query, variables = {}) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

function assertHasError(body, messageSubstring) {
  if (!body.errors?.length) {
    throw new Error(`Expected errors, got: ${JSON.stringify(body)}`);
  }
  const msg = body.errors[0].message;
  if (!msg.includes(messageSubstring)) {
    throw new Error(`Expected error message to contain "${messageSubstring}", got: "${msg}"`);
  }
  if (body.errors[0].extensions?.code !== 'BAD_USER_INPUT') {
    throw new Error(`Expected code BAD_USER_INPUT, got: ${body.errors[0].extensions?.code}`);
  }
}

async function main() {
  console.log('Testing validation errors (server must be running on port 4000)...\n');

  // createUser: empty username
  let body = await graphql(`
    mutation {
      createUser(username: "", displayName: "Test User") {
        id
        username
      }
    }
  `);
  assertHasError(body, 'Username is required');
  console.log('✓ createUser with empty username returns expected error');

  // createUser: empty displayName
  body = await graphql(`
    mutation {
      createUser(username: "testuser", displayName: "") {
        id
        username
      }
    }
  `);
  assertHasError(body, 'Display name is required');
  console.log('✓ createUser with empty display name returns expected error');

  // publishPost: empty title
  body = await graphql(`
    mutation {
      publishPost(title: "", body: "Some body", authorUsername: "someone") {
        id
        title
      }
    }
  `);
  assertHasError(body, 'Title is required');
  console.log('✓ publishPost with empty title returns expected error');

  // publishPost: user not found
  body = await graphql(`
    mutation {
      publishPost(title: "Hi", body: "Body", authorUsername: "nonexistent_user_12345") {
        id
        title
      }
    }
  `);
  assertHasError(body, 'User not found');
  assertHasError(body, 'nonexistent_user_12345');
  console.log('✓ publishPost with unknown author returns expected error');

  console.log('\nAll error tests passed.');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
