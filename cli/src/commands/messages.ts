import { Command } from "commander";
import { envelope, printJson, readText } from "../lib.js";
import { parseMessagePage } from "../parsers/messagePage.js";

export function messagesCommand(): Command {
  const command = new Command("messages").description("Read-only message folder helpers.");

  command
    .command("folders")
    .description("List currently mapped Goodreads message folders.")
    .option("--fixture <path>", "Optional inbox HTML fixture for provenance.")
    .action(async (options: { fixture?: string }) => {
      const warnings = [];
      if (options.fixture) {
        await readText(options.fixture);
      } else {
        warnings.push("Using mapped default folders; pass --fixture to prove them from the current account UI.");
      }
      printJson(
        envelope(
          {
            folders: [
              { slug: "inbox", href: "/message/inbox" },
              { slug: "saved", href: "/message/saved" },
              { slug: "sent", href: "/message/sent" },
              { slug: "trash", href: "/message/trash" }
            ]
          },
          { warnings, confidence: options.fixture ? "high" : "medium" }
        )
      );
    });

  command
    .command("list")
    .description("Parse a message folder fixture into redacted message metadata.")
    .requiredOption("--fixture <path>", "Local message folder HTML fixture.")
    .option("--json", "Emit JSON.", true)
    .action(async (options: { fixture: string }) => {
      const parsed = parseMessagePage(await readText(options.fixture));
      printJson(envelope(parsed, { confidence: parsed.messageLinks.length > 0 ? "high" : "medium" }));
    });

  return command;
}
