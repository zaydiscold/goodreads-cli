# Goodreads Passive Recon Notes

Generated: 2026-05-22T08:25:00Z

## Boundary

Only passive, low-impact discovery was run:

- `robots.txt`
- sitemap indexes and a few gzipped sitemap samples
- passive subdomain discovery via `subfinder`
- a short archived-URL sample
- local tool inventory

Not run without explicit approval:

- Charles/mitmproxy interception
- packet capture with Wireshark/tshark/tcpdump
- port scanning with naabu
- endpoint brute forcing with ffuf/feroxbuster
- nuclei templates
- destructive or mutating Goodreads actions

## Tool Inventory

Installed and available:

- `subfinder`
- `katana`
- `waybackurls`
- `gau`
- `hakrawler`
- `feroxbuster`
- `ffuf`
- `amass`
- `dnsx`
- `naabu`
- `nuclei`
- `mitmproxy`
- `tshark`
- `tcpdump`
- `jq`
- `gh`
- `curl`
- `browser-harness-js`
- `bird`

Installed GUI/network/reversing apps:

- `Charles.app`
- `Wireshark.app`
- `ghidra_12.0.3`

Notes:

- Charles is useful once we want request/response body interception from the real browser, but it should be explicit because it changes trust/proxy state.
- Ghidra is not useful for normal Goodreads web/API mapping unless we pivot to a native/mobile binary or packaged app.
- Subfinder/sitemaps are useful now because they do not require touching authenticated state.

## robots.txt Findings

`https://www.goodreads.com/robots.txt` exposes useful route classes:

- Explicitly disallowed for general crawlers: `/api`, `/review/list`, `/review/show`, `/quotes/list_rss`, `/review/list_rss`, `/shelf/user_shelves`, `/tooltips`, `/track`, `/user/updates_rss`, `/friend/add_as_friend`.
- Explicitly allowed public work routes: `/work/editions`, `/work/quotes`.
- `GPTBot` and `CCBot` are disallowed globally.
- Sitemap indexes are listed for author, award, blog, book community questions, genre, giveaway, group, interview, list, quote, quote tags, related work, topic, and user surfaces.

Why this matters:

- `robots.txt` names internal route families worth mapping, but it is not permission to scrape or mutate.
- `/tooltips`, `/shelf/user_shelves`, `/review/list`, and `/review/show` are strong candidates because they match the authenticated browser traffic we captured.
- RSS endpoints may provide lower-friction read paths for public updates and lists.

## Sitemap Findings

`https://www.goodreads.com/sitemap.xml` returned 404. The real entrypoints are the site indexes from `robots.txt`.

Observed sitemap-index shard counts:

| Index | Shards |
|---|---:|
| author | 180 |
| author_community_question | 13 |
| award | 1 |
| blog | 1 |
| book_community_question | 8 |
| genre | 1 |
| giveaway | 1 |
| group | 1 |
| index | 1 |
| interview | 1 |
| list | 3 |
| quote | 111 |
| quote_tag | 125 |
| related_work | 1 |
| topic | 56 |
| user | 16 |

Sample route templates from sitemap shards:

- `/user/show/:id-:slug`
- `/quotes/:id-:slug`
- `/topic/show/:id-:slug`

Nuance:

- Sitemaps were updated recently (`2026-05-16` lastmod values observed), so they are current enough to derive route templates.
- `siteindex.user.xml` has public user profile shards, useful for profile parser shape.
- `siteindex.quote.xml` and `siteindex.topic.xml` are large enough that sampling is better than dumping all URLs into context.

## Passive Subdomains

`subfinder -d goodreads.com -silent` returned:

```text
admin.goodreads.com
ads.goodreads.com
api.goodreads.com
bookads2.goodreads.com
compressed.photo.goodreads.com
express.goodreads.com
ext.goodreads.com
fw.goodreads.com
fw1.goodreads.com
fw3.goodreads.com
help.goodreads.com
irc.goodreads.com
kcw.goodreads.com
lb.goodreads.com
mail1.goodreads.com
mail2.goodreads.com
mail20.goodreads.com
mail21.goodreads.com
mail22.goodreads.com
mail23.goodreads.com
mail24.goodreads.com
mail25.goodreads.com
mail26.goodreads.com
mail27.goodreads.com
mi.goodreads.com
nl.goodreads.com
old.goodreads.com
onixftp.goodreads.com
origin-www.goodreads.com
photo.goodreads.com
priority.goodreads.com
rd.goodreads.com
remote1.goodreads.com
remote2.goodreads.com
sli.goodreads.com
www.goodreads.com
www.help.goodreads.com
```

Interesting candidates:

- `api.goodreads.com`: legacy API host to probe carefully for current behavior/status.
- `old.goodreads.com`: possible legacy HTML/UI route shapes.
- `photo.goodreads.com` and `compressed.photo.goodreads.com`: asset URL normalization.
- `help.goodreads.com`: docs/help content for user-facing feature names.
- `origin-www.goodreads.com`: do not hit directly without a reason; likely origin routing.

Certificate transparency via `crt.sh` returned HTTP 404 in this run; use `subfinder` and possibly alternate CT providers if this matters.

## Archived URL Mining

`waybackurls` produced a very noisy Shelfari/legacy URL stream before it was stopped after sampling. This is still useful:

- It surfaced old `?shelfari_flash=true` route variants.
- It confirmed old `/books/:id/:slug`, `/authors/:id/.../books`, `/shelf`, and `/readers-reviews` shapes.
- Raw archived URL dumps are too large; future use should normalize to route templates immediately.

Safer future pattern:

```bash
printf 'https://www.goodreads.com\n' |
  waybackurls |
  rg -i '/(api|review|quotes|friend|user|topic|book|shelf|notifications|notes|tooltips|track|ajax|load_more)' |
  sed -E 's#[0-9]{2,}#:id#g; s#\\?.*$##' |
  sort -u |
  sed -n '1,200p'
```

Do not dump full archive output into notes; it explodes context and mostly repeats book URLs.

## Next Recon Steps

1. Use CDP to capture response bodies for only a few candidate XHR endpoints: `/user/delayable_user_show/:id`, `/notes/:id/load_more`, `/tooltips`, `/notifications/track` behavior metadata.
2. Sample `api.goodreads.com` with non-authenticated harmless status probes and document whether it is truly dead, redirected, or partially alive.
3. Use sitemap shards to build a route-template inventory, not a URL corpus.
4. Use Charles only if we need request/response bodies that CDP cannot capture cleanly, and only after approving proxy setup.
5. Keep the first CLI read-only until routes and auth risks are mapped.
