import { Command } from "commander";
import { envelope, printJson, readText } from "../lib.js";
import { parseNotesPage } from "../parsers/notesPage.js";

export function notesCommand(): Command {
  const command = new Command("notes").description("Read Kindle notes/highlights metadata without raw highlight text.");

  command
    .command("inspect")
    .description("Parse notes index or book-detail HTML into redacted metadata.")
    .requiredOption("--fixture <path>", "Local notes HTML fixture.")
    .option("--json", "Emit JSON.", true)
    .action(async (options: { fixture: string }) => {
      const parsed = parseNotesPage(await readText(options.fixture));
      printJson(envelope(parsed, { confidence: parsed.noteCount > 0 || parsed.noteBookLinks.length > 0 ? "high" : "medium" }));
    });

  return command;
}
