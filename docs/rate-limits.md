# Rate Limits

Goodreads does not publish stable web scraping limits.

Conservative defaults:

- Prefer fixture-backed parsing while developing.
- Keep authenticated HTML requests sequential.
- Start at roughly 30 requests per minute for live reads.
- Back off on `429`, `503`, Cloudflare interstitials, or login redirects.
- Never parallelize browser-harness sniffing across multiple Goodreads tabs.
