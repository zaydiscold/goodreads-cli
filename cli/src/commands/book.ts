import { Command } from "commander";
import { fetchText, goodreadsUrl } from "../client/http.js";
import { envelope, printJson, readText } from "../lib.js";
import { parseBookPage } from "../parsers/bookPage.js";

interface BookOptions {
  fixture?: string;
  baseUrl?: string;
  json?: boolean;
}

export function bookCommand(): Command {
  const command = new Command("book").description("Parse public Goodreads book pages.");

  command
    .command("show")
    .description("Show normalized JSON-LD and Next.js metadata for a book page.")
    .argument("[slug-or-id]", "Goodreads book slug or id.")
    .option("--fixture <path>", "Parse a local book HTML fixture instead of fetching.")
    .option("--base-url <url>", "Goodreads base URL.", "https://www.goodreads.com")
    .option("--json", "Emit JSON.", true)
    .action(async (slugOrId: string | undefined, options: BookOptions) => {
      const html = options.fixture
        ? await readText(options.fixture)
        : await fetchText(goodreadsUrl(`/book/show/${slugOrId}`, options.baseUrl));
      const parsed = parseBookPage(html);
      printJson(envelope(parsed, { confidence: parsed.jsonLdBook.name ? "high" : "medium" }));
    });

  return command;
}
