# GET /tooltips

Mutation: no
Risk: read

Summary: Batch tooltip metadata for book ids shown in shelf/list pages.

Tags: books

Parameters:
- resources[Book.{id}][id] (query)
- resources[Book.{id}][type] (query)
- use_wtr_tooltip (query)

Source: api-map/openapi/undocumented/goodreads-web.yaml
