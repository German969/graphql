/**
 * Cache update helpers for mutations.
 * Used with Apollo Client's useMutation update option.
 */

/**
 * Check if storeFieldName matches our query vars.
 * Apollo uses "postsConnection:{\"first\":5,...}" or similar.
 */
function storeFieldMatches(storeFieldName, queryVars) {
  const want = {
    first: queryVars.first ?? 5,
    after: queryVars.after ?? null,
    authorUsername: queryVars.authorUsername ?? null,
    orderBy: queryVars.orderBy ?? 'PUBLISHED_AT_DESC',
  }
  const jsonMatch = storeFieldName.match(/postsConnection:(.+)/)
  if (!jsonMatch) return false
  try {
    const stored = JSON.parse(jsonMatch[1])
    return (
      (stored.first ?? 5) === want.first &&
      (stored.after ?? null) === want.after &&
      (stored.authorUsername ?? null) === want.authorUsername &&
      (stored.orderBy ?? 'PUBLISHED_AT_DESC') === want.orderBy
    )
  } catch {
    return false
  }
}

/**
 * Prepend a post to postsConnection in the cache.
 * Removes any optimistic post (id starting with "optimistic-") when adding the real one.
 */
export function prependPostToConnection(cache, newPost, queryVars) {
  cache.modify({
    fields: {
      postsConnection(existingConnection, { storeFieldName, readField }) {
        if (!storeFieldMatches(storeFieldName, queryVars)) return existingConnection

        const existingEdges = existingConnection?.edges ?? []
        const newEdge = {
          __typename: 'PostEdge',
          node: newPost,
          cursor: newPost.id,
        }

        const isRealPost = !String(newPost.id).startsWith('optimistic-')
        const filteredEdges = isRealPost
          ? existingEdges.filter((edge) => {
              const node = readField('node', edge)
              const id = readField('id', node)
              return !String(id).startsWith('optimistic-')
            })
          : existingEdges

        return {
          ...existingConnection,
          edges: [newEdge, ...filteredEdges],
        }
      },
    },
  })
}
