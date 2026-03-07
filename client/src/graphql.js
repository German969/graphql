/**
 * Raw GraphQL client: send a POST with query/mutation and optional variables.
 * No Apollo yet—we learn the protocol first.
 */
export async function graphql(query, variables = {}) {
  const res = await fetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map((e) => e.message).join(', '));
  }
  return json.data;
}
