---
name: goodreads-cli
description: Use the Goodreads API map and live-capable CLI to inspect and modify shelves, books, notes, messages, and account routes.
---

# goodreads-cli

Use this skill when working with Goodreads shelves, books, notes/highlights, messages, or route maps.

## Commands

```bash
goodreads-cli api-map routes --json
goodreads-cli api-map browser-routes --summary --json
goodreads-cli api-map search "publicize notes" --json
goodreads-cli shelves discover --fixture fixtures/private/shelf-to-read.html --json
goodreads-cli books list --shelf read --fixture-dir fixtures/private --json
goodreads-cli books export --fixture-dir fixtures/private --shelves read,to-read --json
goodreads-cli notes inspect --fixture fixtures/private/notes-mr-whisper.html --json
goodreads-cli messages list --fixture fixtures/private/message-inbox.html --json
goodreads-cli write-plan books move --review-id <id> --to-shelf <slug>
goodreads-cli write-plan notes publicize --book-id <id> --user-slug <slug>
goodreads-cli request plan --route "PUT /notes/{book_id}/share" --param book_id=<id>
goodreads-cli request execute --route "PUT /notes/{book_id}/share" --param book_id=<id> --dry-run
```

## MCP

Run `goodreads-cli-mcp` for agent use. It exposes route-map search, sanitized browser-route inventory, dynamic account inventory guidance, dry-run planners, and a risk-annotated `goodreads_request_execute` tool. Reads advertise `mcp:read-only=true`; writes advertise `mcp:read-only=false` plus `mcp:risk`.

Read `docs/mcp-agent-surface.md` before using the MCP planner tools. Goodreads shelves, message folders, notes modules, comments, and pagination are account-specific inventory; discover the current page/account state first.

## Safety

- Discover shelves/folders/modules before acting.
- Treat private fixtures as local-only.
- Do not print raw Kindle highlights, raw message bodies, cookies, CSRF tokens, or private RSS keys.
- Personal-side live writes are real. There is no `GOODREADS_ALLOW_WRITES` env gate.
- Use `GOODREADS_COOKIE` plus `GOODREADS_CSRF_TOKEN` or a current form `authenticity_token` for authenticated Rails-form mutations.
- Mutating live execution prints `[WRITES TO LIVE GOODREADS]` to stderr. Use `--dry-run` when testing.

## Self-Extension Protocol

If you discover an endpoint on Goodreads that is not in `api-map/`:

1. Add it to `api-map/openapi/` and `api-map/markdown/`.
2. Write a parser, fixture, test, or live-safe proof.
3. Open a PR to `zaydiscold/goodreads-cli` main.
4. Tag `@ColdCooks` in the PR description.

If the endpoint is undocumented, document the discovery method in `docs/undocumented-surface.md`.
