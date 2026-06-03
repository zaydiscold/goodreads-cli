import * as cheerio from "cheerio";
import { Command } from "commander";
import { cleanText, envelope, printJson, readText } from "../lib.js";

function parseCommentsFixture(html: string) {
  const $ = cheerio.load(html);
  const commentLinks: Array<{ href: string; labelLength: number }> = [];
  $("a[href*='/comment/'], a[href*='comment_id=']").each((_, element) => {
    const href = $(element).attr("href");
    const label = cleanText($(element).text());
    if (!href) return;
    commentLinks.push({ href, labelLength: label.length });
  });
  const forms: Array<{ method: string; action: string; inputNames: string[] }> = [];
  $("form").each((_, element) => {
    const form = $(element);
    const action = form.attr("action") ?? "";
    if (!/comment/i.test(action)) return;
    forms.push({
      method: (form.attr("method") ?? "GET").toUpperCase(),
      action,
      inputNames: form
        .find("input, textarea, select")
        .map((__, input) => $(input).attr("name"))
        .get()
        .filter((name): name is string => Boolean(name))
    });
  });
  return {
    title: cleanText($("title").first().text()) || null,
    commentLinkCount: commentLinks.length,
    commentLinks,
    forms
  };
}

export function commentsCommand(): Command {
  const command = new Command("comments").description("Inspect Goodreads comments/recent-post metadata without raw comment text.");

  command
    .command("list")
    .description("Plan or parse a user comments/recent-post page.")
    .option("--user-slug <slug>", "Goodreads user slug. Required for live URL planning.")
    .option("--fixture <path>", "Comments HTML fixture to parse.")
    .option("--json", "Emit JSON.", true)
    .action(async (options: { userSlug?: string; fixture?: string }) => {
      if (!options.fixture && !options.userSlug) {
        throw new Error("--user-slug is required unless --fixture is supplied");
      }
      const parsed = options.fixture ? parseCommentsFixture(await readText(options.fixture)) : null;
      printJson(
        envelope(
          {
            routeTemplate: "/comment/list/{user_slug}",
            route: options.userSlug ? `/comment/list/${options.userSlug}` : null,
            parsed,
            writeBoundary:
              "Comment writes are not part of notes/highlights visibility and remain disabled until separately captured and approved."
          },
          {
            confidence: parsed ? "high" : "medium"
          }
        )
      );
    });

  return command;
}
