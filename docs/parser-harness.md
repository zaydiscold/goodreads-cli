# Goodreads Parser Harness

Generated: 2026-05-22

## Purpose

The route map is not enough for Goodreads because most useful surfaces are HTML-heavy. This harness turns raw HTML/XML fixtures into normalized JSON so a future PP package can be tested against real pages without logging cookies, raw Kindle highlights, raw message bodies, or full review text.

## Privacy Boundary

Raw private fixtures should live under a local-only fixture directory such as:

```text
<private-fixtures>/
```

That directory is ignored by `.gitignore` and should stay local. Files should be mode `0600`.

Normalized parser output should live under a paired parsed directory such as:

```text
<parsed-fixtures>/
```

This directory is also ignored. The output is redacted, but it can still contain account-visible book/shelf metadata. Shareable test fixtures should be synthetic or manually scrubbed into a separate directory later.

The parser redacts or avoids:

- raw Kindle highlight text;
- raw Goodreads messages;
- Goodreads message sender/subject labels;
- raw review bodies;
- long book descriptions.

## Parser

```bash
python3 goodreads/tools/parse_fixtures.py \
  <private-fixtures>/*.html \
  <private-fixtures>/*.xml
```

Current fixture kinds:

- `shelf_rss`
- `shelf_html`
- `book_page`
- `notes_page`
- `message_page`
- `html_page`

Current bookshelf proof:

- `read`: pages 1-2 parsed to 40 unique review ids, matching the page-declared 40 books.
- `to-read`: pages 1-5 parsed to 132 unique review ids, matching the page-declared 132 books.

This proves the CLI must discover and follow shelf pagination for full export. RSS alone is a fallback, not a full bookshelf source for larger shelves.

## Reproducibility

Public read fixtures can be captured with `curl`; authenticated fixtures should be captured through the logged-in Chrome session with `browser-harness-js`.

Parser fixtures should stay read-focused and redacted. Live write execution is handled by `goodreads-cli request execute`, not by parser fixtures; use `--dry-run` while testing request shape.
