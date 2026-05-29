# Gotchas

- Goodreads shelf names are account inventory, not a global enum.
- Public RSS appears capped at 100 items for larger shelves.
- Authenticated shelf HTML uses pagination, often 30 rows per page.
- Book pages are Next.js-backed and include JSON-LD plus `__NEXT_DATA__`.
- `__NEXT_DATA__` can contain public review bodies; do not store raw review text by default.
- Kindle note pages can contain raw highlight text; emit metadata unless the user explicitly asks for owned export.
- Message pages can contain private sender/subject/body data; default to ids and structural metadata.
- Goodreads can show Cloudflare or Amazon SSO friction. Re-authentication is the fix, not blind retries.
