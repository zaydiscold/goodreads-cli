# MCP Agent Surface

The MCP package exposes both read and live-capable write surfaces for the personal Goodreads CLI. Read tools are annotated `mcp:read-only=true`; the executor is annotated `mcp:read-only=false` and `mcp:risk=write-mutate`.

## Tools

- `goodreads_api_map_routes` lists the bundled web/RSS route map.
- `goodreads_route_search` searches mapped capabilities such as notes publicizing, shelf exports, message folders, friends, and profile pages.
- `goodreads_browser_routes` lists sanitized authenticated Chrome CDP route templates from the 2026-05-26 recapture.
- `goodreads_bookshelf_move_plan` returns a dry-run form plan for moving an existing review row to another shelf.
- `goodreads_notes_publicize_plan` returns a dry-run plan for the notes/highlights publicize route.
- `goodreads_request_execute` executes a live request by route selector. Use `dryRun: true` to preview.
- `goodreads_dynamic_inventory_guidance` explains which account-specific collections must be discovered before acting.

## Dynamic Inventory Rule

Goodreads surfaces are not global constants. A user's shelves, message folders, note modules, friend links, comments, review IDs, and pagination change by account and over time. The CLI should discover the current page/account inventory before resolving aliases like `to-read` or planning a form action.

Seeded Zayd routes are valid examples, not universal truth. Treat per-user/per-book/per-message links as discovered inventory and keep adding them to `api-map/` with evidence.

## Write Boundary

The personal repo has no env write gate. Do not submit notes, shelf, message, review, profile, rating, or account changes unless the caller intentionally selected the route and supplied the current account/session inputs needed for that request.

Known notes/highlights publicize shape:

```text
PUT /notes/{book_id}/share
```

After any approved live run, reload the notes page and verify the visible state before claiming success.
