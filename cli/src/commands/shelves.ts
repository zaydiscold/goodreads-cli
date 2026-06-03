import { Command } from "commander";
import { fetchText, goodreadsUrl } from "../client/http.js";
import { envelope, printJson, readText } from "../lib.js";
import { parseShelfHtml } from "../parsers/shelfHtml.js";

interface ShelvesOptions {
  fixture?: string;
  user?: string;
  baseUrl?: string;
  json?: boolean;
}

export function shelvesCommand(): Command {
  const command = new Command("shelves").description("Discover account-specific Goodreads shelf inventory.");

  command
    .command("discover")
    .description("Discover shelf slugs and counts from a Goodreads shelf page.")
    .option("--fixture <path>", "Parse a local shelf HTML fixture instead of fetching.")
    .option("--user <user>", "Goodreads numeric id or slug. Required unless --fixture is supplied.")
    .option("--base-url <url>", "Goodreads base URL.", "https://www.goodreads.com")
    .option("--json", "Emit JSON.", true)
    .action(async (options: ShelvesOptions) => {
      if (!options.fixture && !options.user) {
        throw new Error("--user is required unless --fixture is supplied");
      }
      const html = options.fixture
        ? await readText(options.fixture)
        : await fetchText(goodreadsUrl(`/review/list/${options.user}`, options.baseUrl));
      const parsed = parseShelfHtml(html);
      const warnings: string[] = [];
      if (parsed.shelfInventory.length === 0) {
        warnings.push("No shelf inventory was discovered. The page may be private, logged out, or structurally changed.");
      }
      printJson(
        envelope(
          {
            shelves: parsed.shelfInventory,
            page: {
              title: parsed.title,
              declaredBookCount: parsed.declaredBookCount
            }
          },
          { warnings, confidence: parsed.shelfInventory.length > 0 ? "high" : "low" }
        )
      );
    });

  return command;
}
