import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { Command } from "commander";
import { fetchText, goodreadsUrl } from "../client/http.js";
import { envelope, fileExists, parseCsv, printJson, readText } from "../lib.js";
import { parseShelfHtml } from "../parsers/shelfHtml.js";
import { parseShelfRss } from "../parsers/rss.js";
import type { PaginationSummary, ShelfBookRow, ShelfHtmlParse, ShelfInventoryItem } from "../types/index.js";

interface BooksListOptions {
  shelf?: string;
  user?: string;
  baseUrl?: string;
  fixtureDir?: string;
  source?: "html" | "rss";
  json?: boolean;
}

interface BooksExportOptions extends BooksListOptions {
  shelves?: string;
}

function pageNumber(parsed: ShelfHtmlParse): number {
  return parsed.currentPage ?? 1;
}

async function readShelfPagesFromFixtureDir(dir: string, shelf: string): Promise<ShelfHtmlParse[]> {
  const files = await readdir(dir);
  const candidates = files
    .filter((file) => file === `shelf-${shelf}.html` || file.match(new RegExp(`^shelf-${shelf}-page\\d+\\.html$`)))
    .sort((a, b) => {
      const pageA = Number(a.match(/page(\d+)/)?.[1] ?? "1");
      const pageB = Number(b.match(/page(\d+)/)?.[1] ?? "1");
      return pageA - pageB;
    });
  return Promise.all(candidates.map(async (file) => parseShelfHtml(await readText(join(dir, file)))));
}

function summarizePages(pages: ShelfHtmlParse[]): {
  rows: ShelfBookRow[];
  pagination: PaginationSummary;
  shelfInventory: ShelfInventoryItem[];
} {
  const rowMap = new Map<string, ShelfBookRow>();
  const declaredCounts = new Set<number>();
  const pagesSeen = new Set<number>();
  const shelfInventory = new Map<string, ShelfInventoryItem>();

  for (const page of pages) {
    if (page.declaredBookCount !== null) declaredCounts.add(page.declaredBookCount);
    pagesSeen.add(pageNumber(page));
    for (const shelf of page.shelfInventory) shelfInventory.set(shelf.slug, shelf);
    for (const row of page.rows) {
      const key = row.reviewId ?? row.bookId ?? row.bookHref ?? row.title;
      if (key) rowMap.set(key, row);
    }
  }

  const declaredCount = declaredCounts.size === 1 ? [...declaredCounts][0] ?? null : null;
  const rows = [...rowMap.values()];
  return {
    rows,
    shelfInventory: [...shelfInventory.values()],
    pagination: {
      mode: "auto",
      pagesSeen: [...pagesSeen].sort((a, b) => a - b),
      declaredCount,
      parsedCount: rows.length,
      complete: declaredCount !== null && rows.length === declaredCount
    }
  };
}

async function listFromHtmlFixtures(shelf: string, dir: string) {
  const pages = await readShelfPagesFromFixtureDir(dir, shelf);
  if (pages.length === 0) {
    throw new Error(`No shelf fixtures found for '${shelf}' in ${dir}`);
  }
  return summarizePages(pages);
}

async function listFromRss(shelf: string, user: string, baseUrl: string) {
  const xml = await fetchText(goodreadsUrl(`/review/list_rss/${user}?shelf=${encodeURIComponent(shelf)}`, baseUrl));
  return parseShelfRss(xml);
}

export function booksCommand(): Command {
  const command = new Command("books").description("List and export Goodreads shelf books.");

  command
    .command("list")
    .description("List one shelf from authenticated HTML fixtures or public RSS.")
    .requiredOption("--shelf <slug>", "Shelf slug, discovered with shelves discover.")
    .option("--fixture-dir <dir>", "Directory containing shelf HTML fixtures.")
    .option("--source <source>", "html or rss.", "html")
    .option("--user <user>", "Goodreads numeric id or slug.", "179929687")
    .option("--base-url <url>", "Goodreads base URL.", "https://www.goodreads.com")
    .option("--json", "Emit JSON.", true)
    .action(async (options: BooksListOptions) => {
      const shelf = options.shelf ?? "";
      if (options.fixtureDir) {
        const data = await listFromHtmlFixtures(shelf, options.fixtureDir);
        printJson(envelope({ shelf, ...data }, { warnings: data.pagination.complete ? [] : ["Shelf export is incomplete."] }));
        return;
      }

      const rss = await listFromRss(shelf, options.user ?? "179929687", options.baseUrl ?? "https://www.goodreads.com");
      const warnings = rss.signals.rssMayCapAt100 ? ["RSS returned exactly 100 items; this may be capped."] : [];
      printJson(envelope({ shelf, rss }, { warnings, confidence: rss.signals.rssMayCapAt100 ? "medium" : "high" }));
    });

  command
    .command("export")
    .description("Export one or more shelves from fixture-backed authenticated HTML.")
    .option("--fixture-dir <dir>", "Directory containing shelf HTML fixtures.", "fixtures/private")
    .option("--shelves <csv>", "Comma-separated shelf slugs. Defaults to discovered shelf fixture files.")
    .option("--json", "Emit JSON.", true)
    .action(async (options: BooksExportOptions) => {
      const dir = options.fixtureDir ?? "fixtures/private";
      let shelves = parseCsv(options.shelves);
      if (shelves.length === 0) {
        const files = await readdir(dir);
        shelves = [
          ...new Set(
            files
              .map((file) => file.match(/^shelf-(.+?)(?:-page\d+)?\.html$/)?.[1])
              .filter((value): value is string => Boolean(value))
          )
        ];
      }

      const perShelf = [];
      const booksById = new Map<string, ShelfBookRow & { shelves: string[] }>();
      const warnings: string[] = [];

      for (const shelf of shelves) {
        const hasFirstPage = fileExists(join(dir, `shelf-${shelf}.html`));
        if (!hasFirstPage) {
          warnings.push(`Missing first-page fixture for shelf '${shelf}'.`);
          continue;
        }
        const result = await listFromHtmlFixtures(shelf, dir);
        perShelf.push({
          shelf,
          pagination: result.pagination
        });
        if (!result.pagination.complete) warnings.push(`Shelf '${shelf}' is incomplete.`);
        for (const row of result.rows) {
          const key = row.bookId ?? row.reviewId ?? row.bookHref ?? row.title;
          if (!key) continue;
          const existing = booksById.get(key);
          if (existing) {
            existing.shelves.push(shelf);
          } else {
            booksById.set(key, { ...row, shelves: [shelf] });
          }
        }
      }

      printJson(
        envelope(
          {
            shelves,
            perShelf,
            books: [...booksById.values()]
          },
          { warnings, confidence: warnings.length === 0 ? "high" : "medium" }
        )
      );
    });

  return command;
}
