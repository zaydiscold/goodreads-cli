# @zaydiscold/goodreads-cli

Live-capable Goodreads CLI backed by the repo API map.

## Commands

```bash
goodreads-cli api-map routes --json
goodreads-cli api-map browser-routes --summary --json
goodreads-cli api-map search "publicize notes" --json
goodreads-cli shelves discover --fixture ../fixtures/private/shelf-to-read.html --json
goodreads-cli books list --shelf read --fixture-dir ../fixtures/private --json
goodreads-cli books export --fixture-dir ../fixtures/private --shelves read,to-read --json
goodreads-cli book show 57905101-the-gate-of-the-feral-gods --json
goodreads-cli messages folders --json
goodreads-cli messages list --fixture ../fixtures/private/message-inbox.html --json
goodreads-cli notes inspect --fixture ../fixtures/private/notes-mr-whisper.html --json
goodreads-cli write-plan books move --review-id 8621721347 --to-shelf read
goodreads-cli write-plan notes publicize --book-id 48526390 --user-slug 179929687-zayd-khan
goodreads-cli request execute --route "PUT /notes/{book_id}/share" --param book_id=48526390 --dry-run
```

`request execute` is live by default and has no env write gate. Use `--dry-run` to preview; mutating routes require caller-owned Goodreads cookie/CSRF inputs and print a live-write warning.
