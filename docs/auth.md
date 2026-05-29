# Auth

Goodreads uses browser cookie sessions and can redirect through Amazon SSO.

Current implementation rules:

- Public RSS and public book pages do not require cookies.
- Full bookshelf export should use an authenticated browser/session fixture or caller-provided `GOODREADS_COOKIE`.
- Do not commit cookies, CSRF tokens, private RSS keys, or raw session captures.
- If Amazon SSO returns `403` or redirects to login, retries will not fix it; re-authenticate in the browser.
- Personal-side live execution has no `GOODREADS_ALLOW_WRITES` gate.
- `GOODREADS_COOKIE` is required for authenticated live mutations.
- `GOODREADS_CSRF_TOKEN` or a current form `authenticity_token` is required for POST/PUT/PATCH/DELETE Rails-form mutations.

Write routes use Rails-style `authenticity_token` form fields. `goodreads-cli request execute` sends real requests unless `--dry-run` is supplied, and mutating routes print `[WRITES TO LIVE GOODREADS]` to stderr before execution.
