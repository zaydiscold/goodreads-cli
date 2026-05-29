# Write Operations

The personal Goodreads CLI is live read/write capable. It is not PP-side software and does not use an env write gate such as `GOODREADS_ALLOW_WRITES`.

## Runtime Contract

- `goodreads-cli request execute` sends a real Goodreads request by default.
- `--dry-run` previews the method, URL, path params, auth requirements, and body mode without sending.
- Mutating routes print `[WRITES TO LIVE GOODREADS]` to stderr before execution.
- Authenticated writes require caller-owned `GOODREADS_COOKIE`.
- Rails-form writes require `GOODREADS_CSRF_TOKEN` or a current form `authenticity_token`.

## Risk Levels

The CLI uses the shared risk enum:

- `read` for routes that only inspect pages, RSS, or local maps.
- `write-safe` reserved for idempotent or additive account actions.
- `write-mutate` for POST/PUT/PATCH account mutations such as notes publicizing, shelf edits, and message state changes.
- `write-destructive` for DELETE routes if mapped later.

## Examples

```bash
goodreads-cli request plan --route "PUT /notes/{book_id}/share" --param book_id=<book-id>
goodreads-cli request execute --route "PUT /notes/{book_id}/share" --param book_id=<book-id> --dry-run
GOODREADS_COOKIE='<cookie-header>' GOODREADS_CSRF_TOKEN='<token>' \
  goodreads-cli request execute --route "PUT /notes/{book_id}/share" --param book_id=<book-id>
```

After a live mutation, reload the relevant Goodreads page and verify the account-visible state before claiming success.
