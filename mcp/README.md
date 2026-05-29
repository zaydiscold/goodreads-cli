# goodreads-cli-mcp

Private MCP server for the live-capable Goodreads API map companion.

```bash
pnpm --filter @zaydiscold/goodreads-mcp build
node mcp/dist/server.js
```

Tools:

- `goodreads_api_map_routes`
- `goodreads_route_search`
- `goodreads_browser_routes`
- `goodreads_bookshelf_move_plan`
- `goodreads_notes_publicize_plan`
- `goodreads_request_execute`
- `goodreads_dynamic_inventory_guidance`

Read tools advertise `mcp:read-only=true`; the live executor advertises `mcp:read-only=false` and `mcp:risk=write-mutate`. The personal repo has no env write gate, so use `dryRun: true` when previewing.
