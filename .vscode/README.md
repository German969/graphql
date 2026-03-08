# Workspace settings

## GraphQL syntax highlighting

If `.graphql` files don’t show syntax highlighting:

1. **Set the language for the current file**  
   - Click the language label in the **status bar** (bottom right), e.g. “Plain Text”.  
   - Choose **GraphQL**.  
   - Or: **Cmd+Shift+P** → “Change Language Mode” → type **GraphQL** → Enter.

2. **Reload the window**  
   - **Cmd+Shift+P** → “Developer: Reload Window” so extensions and `files.associations` are applied, then reopen the file.

3. **Confirm the extension**  
   - Extensions view (Cmd+Shift+X): search “GraphQL: Syntax Highlighting” (GraphQL Foundation).  
   - It should be enabled and contribute language `graphql` for `*.graphql`, `*.gql`, `*.graphqls`.
