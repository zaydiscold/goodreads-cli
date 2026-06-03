# goodreads-cli

I wanted to run my entire Goodreads life from the terminal (and from my agents) — shelve a book, rate it, fire off a review, enter a giveaway, log reading progress — without ever opening the website. Amazon killed the public Goodreads API for new keys back in December 2020, so there was nothing to call. So I sat down, mapped the whole logged-in surface myself with CDP capture, and built this on top of the map.

It's a TypeScript CLI plus an MCP server, both driving the same hand-mapped API. The map is the headline; the CLI and MCP are just the proof that the map is real and complete enough to drive.

## What it does

Full read **and** write across Goodreads:

- **Shelves** — add a book to a shelf, create custom shelves, rename/edit, reorder items.
- **Ratings** — set and clear star ratings through the modern AppSync **GraphQL** ops (`RateBook` / `UnrateBook`), not the legacy form path.
- **Reviews** — write and edit reviews, publicize them, and flag spoilers; bulk-edit and delete too.
- **Friends** — add and remove friends, send invites.
- **Groups** — browse and create groups.
- **Listopia lists** — read lists and create your own.
- **Reading challenges** — pull goals, quests, and achievement data.
- **Kindle Notes & Highlights** — read your notes per book, paginated.
- **Recent-reading notes workflows** — join current/read shelves to Kindle notes visibility, plan publicizing, and keep raw highlight text private.
- **Comments and annotations** — inspect route/metadata shape without emitting raw comment bodies or highlight text.
- **Quotes** — add, remove, and reorder quotes (up/down/top/bottom).
- **Recommendations** — yours and friends'.
- **Genre / topic search** — genres, topics, discussions.
- **Giveaways** — browse and enter (including Kindle giveaways).
- **Home feed** — post a status, update reading progress, and comment.

Most workflow commands default to **dry-run** — they print the exact request they would send and stop. The low-level `request execute` command is intentionally live-capable by default for mapped routes, so pass `--dry-run` when previewing it. The notes/highlights publicize workflow is stricter: it requires `--execute`, an exact `--approved-book-id`, `GOODREADS_ALLOW_NOTES_PUBLICIZE=1`, and caller-owned session inputs before it will submit.

## Recent Reading And Notes

```bash
goodreads-cli recent-reading list --fixture-dir <private-fixtures> --shelves currently-reading,read --limit 25 --json
goodreads-cli recent-reading notes --fixture-dir <private-fixtures> --notes-index-fixture <notes-index.html> --json
goodreads-cli recent-reading publicize-plan --fixture-dir <private-fixtures> --approved-book-id <book-id> --json
goodreads-cli notes publicize-plan --book-id <book-id> --book-slug <book-slug> --user-slug <user-slug> --detail-fixture <notes-detail.html> --approved-book-id <book-id> --json
GOODREADS_ALLOW_NOTES_PUBLICIZE=1 goodreads-cli notes publicize --book-id <book-id> --approved-book-id <book-id> --execute --json
```

These commands never emit raw Kindle highlight text. The write route uses numeric `book_id`; reload verification uses `/notes/{book_slug}/{user_slug}` from the notes link. Public proof should include only counts, status, timing, and redacted route shape.

## The map is the point

The real artifact lives in [`api-map/`](./api-map/):

- An **OpenAPI 3.1** spec of the undocumented Goodreads web surface.
- **Per-endpoint Markdown** under [`api-map/markdown/`](./api-map/markdown/) — including the full read+write capture in [`full-surface-2026-05-28.md`](./api-map/markdown/full-surface-2026-05-28.md).
- A **curl** reference at [`api-map/curl/goodreads-web.sh`](./api-map/curl/goodreads-web.sh) so any of it is reproducible without this CLI.

It covers roughly **60 read routes** (HTML pages, RSS, and CSV exports), about **30 write endpoints** (Rails-UJS form POSTs captured from `data-remote` actions but never fired), and the **AppSync GraphQL** ops for the modern book/rating/feed widgets. Goodreads is a Rails app, so reads are mostly page routes, writes are form POSTs needing a CSRF token, and the newer surfaces speak GraphQL with a separate JWT.

## Extending it

Found an endpoint I missed? Add it to the OpenAPI spec and a Markdown page under `api-map/`, then wire a command in `cli/` (and an MCP tool in `mcp/` if agents should reach it). The map stays the source of truth — the commands are generated against it.

## Install

```bash
pnpm install
pnpm -r build
goodreads-cli --help
```

The MCP server runs with `goodreads-cli-mcp`.

---

Built on the trio pattern (CLI + skill + MCP) pioneered by [Matt Van Horn's Printing Press](https://github.com/mvanhorn/cli-printing-press).

Mapped & built by Zayd Khan ([@ColdCooks](https://twitter.com/ColdCooks) / [zaydiscold](https://github.com/zaydiscold)). MIT © Zayd Khan.
