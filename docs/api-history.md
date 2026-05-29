# Goodreads API History

Goodreads retired the public developer API for new keys in December 2020. Current integrations generally use one of four lanes:

- public RSS feeds, especially `/review/list_rss/:user?shelf=:shelf`;
- authenticated Goodreads HTML parsing;
- public book page JSON-LD and Next.js `__NEXT_DATA__`;
- old XML API routes only when a user already has legacy credentials.

This repo exists because Goodreads still exposes useful user-owned data in web surfaces, but there is no current official public API path for new integrations.
