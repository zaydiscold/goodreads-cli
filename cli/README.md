# @zaydiscold/goodreads-cli

Live-capable Goodreads CLI backed by the repo API map.

## Commands

```bash
goodreads-cli api-map routes --json
goodreads-cli api-map browser-routes --summary --json
goodreads-cli api-map search "publicize notes" --json
goodreads-cli shelves discover --fixture <private-fixtures>/shelf-to-read.html --json
goodreads-cli books list --shelf read --fixture-dir <private-fixtures> --json
goodreads-cli books export --fixture-dir <private-fixtures> --shelves read,to-read --json
goodreads-cli book show 57905101-the-gate-of-the-feral-gods --json
goodreads-cli messages folders --json
goodreads-cli messages list --fixture <private-fixtures>/message-inbox.html --json
goodreads-cli notes inspect --fixture <private-fixtures>/notes-detail.html --json
goodreads-cli recent-reading notes --fixture-dir <private-fixtures> --json
goodreads-cli notes publicize-plan --book-id <book-id> --book-slug <book-slug> --user-slug <user-slug> --approved-book-id <book-id> --json
GOODREADS_ALLOW_NOTES_PUBLICIZE=1 goodreads-cli notes publicize --book-id <book-id> --approved-book-id <book-id> --execute --json
goodreads-cli write-plan books move --review-id <review-id> --to-shelf read
goodreads-cli write-plan notes publicize --book-id <book-id> --book-slug <book-slug> --user-slug <user-slug>
goodreads-cli request execute --route "PUT /notes/{book_id}/share" --param book_id=<book-id> --dry-run
```

`request execute` is live by default and has no generic env write gate. Use `--dry-run` to preview; mutating routes require caller-owned Goodreads cookie/CSRF inputs and print a live-write warning. The higher-level notes publicize workflow adds `GOODREADS_ALLOW_NOTES_PUBLICIZE=1`, `--execute`, and exact approved book-id checks. Notes writes use numeric `book_id`; notes detail verification uses `/notes/{book_slug}/{user_slug}` from the notes link.
