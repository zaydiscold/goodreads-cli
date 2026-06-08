# Notes 06 — DELETE /notes/{book_id}/{annotation_pair_id}

Mutation: yes
Risk: write-mutate (IRREVERSIBLE)

Summary: Delete a single Kindle note/highlight.

Method: POST with _method=delete (Rails UJS convention)
Body: application/x-www-form-urlencoded
  _method=delete
  authenticity_token={token}

Response: {"message":"Reading note was successfully deleted"}

Path params:
- book_id: integer
- annotation_pair_id: string (URL-encoded, from data-annotation-pair-id DOM attribute)

Verified: Live HTTP test 2026-06-08. Returns 200. Note: deletion may be recoverable via
re-publicizing — the endpoint appears to hide rather than permanently destroy the highlight.

Safety: Default dry-run. Requires explicit --execute. IRREVERSIBLE — even if recoverable,
do not test on notes the user wants to keep.
