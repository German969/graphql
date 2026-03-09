# Exercise 9: Real-Time New Post in Admin

**Lessons:** 13 (Subscriptions)

## Goal

Subscribe to new posts in the Admin page so the posts list updates in real time when someone publishes.

## Requirements

1. **Subscription** on Admin page:
   - Use `postPublished` subscription (existing)
   - When a new post is published, append it to the admin posts list or refetch

2. **Display**:
   - New posts appear automatically without clicking "Load more"

## Hints

- Use `useSubscription(POST_PUBLISHED_SUBSCRIPTION, { onData: () => refetch() })`
- Or use `update` to merge the new post into the cache
- Requires auth (subscription uses context)

## Done when

All tests in `09-admin-subscription.spec.js` pass.
