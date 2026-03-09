# Exercise 7: Admin Filter and Order Posts

**Lessons:** 11 (Filtering and ordering)

## Goal

Add filter (by author) and order controls to the Admin posts audit section.

## Requirements

1. **Filter**:
   - Input or select to filter posts by author username
   - Pass `authorUsername` to `postsConnection` query
   - Debounce the filter (e.g. 300ms) to avoid excessive requests

2. **Order**:
   - Dropdown or buttons to change order: newest first, oldest first, title A–Z, title Z–A
   - Pass `orderBy: PostOrderBy` to the query
   - Use existing enum: `PUBLISHED_AT_DESC`, `PUBLISHED_AT_ASC`, `TITLE_ASC`, `TITLE_DESC`

3. **Refetch** when filter or order changes

## Hints

- Reuse pattern from Blog page (authorFilter, orderBy, debounce)
- `postsConnection(first, after, authorUsername, orderBy)` supports these args

## Done when

All tests in `07-admin-filter-order.spec.js` pass.
