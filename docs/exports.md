# Exports

The core user-facing feature is complete shelf export for migration and backup.

Public RSS is useful but incomplete for large shelves. In the 2026-05-22 proof:

- `read` RSS returned all 40 items.
- `to-read` RSS returned 100 items for a 132-book shelf.
- authenticated HTML pagination returned all 132 `to-read` items.

Export strategy:

1. Run shelf discovery from `/review/list/:user`.
2. Follow shelf HTML pagination for each discovered shelf.
3. Deduplicate by `review_id`, then `book_id`.
4. Preserve all shelf memberships per book.
5. Mark a shelf incomplete when parsed count does not match the discovered/declared count.

Potential migration targets: StoryGraph, LibraryThing, and BookWyrm.
