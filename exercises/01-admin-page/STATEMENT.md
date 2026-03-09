# Exercise 1: Admin Page and Routing

**Lessons:** 1 (Schema), 2 (First query), 6 (Apollo Client)

## Goal

Add an Admin Dashboard page and navigation so users can switch between the Blog and Admin.

## Requirements

1. **Admin page** at `/admin` that displays:
   - A heading "Admin Dashboard"
   - A link back to the Blog ("Blog" or "← Blog")

2. **Navigation** from the Blog to Admin:
   - A link "Admin" in the blog header that navigates to `/admin`

3. **Routing** using React Router:
   - `/` shows the Blog (existing feed)
   - `/admin` shows the Admin Dashboard

## Hints

- Use `react-router-dom`: `BrowserRouter`, `Routes`, `Route`, `Link`
- The Admin page can be a simple component with a heading and nav link
- Add the Admin link in `App.jsx` header (minimal change)

## Done when

All tests in `01-admin-page.spec.js` pass.
