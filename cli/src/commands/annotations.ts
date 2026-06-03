import { Command } from "commander";
import { envelope, printJson, readText } from "../lib.js";
import { parseNotesPage } from "../parsers/notesPage.js";

export function annotationsCommand(): Command {
  const command = new Command("annotations").description("Inspect Kindle note/highlight annotation metadata without raw text.");

  command
    .command("list")
    .description("Parse annotation metadata from a notes detail fixture.")
    .requiredOption("--fixture <path>", "Notes detail HTML fixture.")
    .option("--book-id <id>", "Goodreads book id for context.")
    .option("--user-slug <slug>", "Goodreads user slug for context.")
    .option("--include-private-ids", "Emit raw annotation pair ids for private local use.", false)
    .option("--json", "Emit JSON.", true)
    .action(async (options: { fixture: string; bookId?: string; userSlug?: string; includePrivateIds?: boolean }) => {
      const parsed = parseNotesPage(await readText(options.fixture));
      const annotations = parsed.notes.map((note, index) => ({
        ref: `annotation-${index + 1}`,
        annotationPairId: options.includePrivateIds ? note.annotationPairId : note.annotationPairId ? "<redacted>" : null,
        hasAnnotationPairId: Boolean(note.annotationPairId),
        visible: note.visible,
        hasNotePersistEndpoint: Boolean(note.notePersistEndpoint),
        hasSpoilerToggle: note.hasSpoilerToggle
      }));
      printJson(
        envelope(
          {
            bookId: options.bookId ?? null,
            userSlug: options.userSlug ?? null,
            annotationCount: annotations.length,
            annotations,
            thoughtsWrite: {
              routeTemplate: "/notes/{book_id}/{annotation_pair_id}/note",
              status: "plan-only-until-approved-capture"
            }
          },
          {
            warnings: options.includePrivateIds
              ? ["Raw annotation pair ids emitted for private local use; do not put this output in shareable proofs."]
              : [],
            confidence: annotations.length > 0 ? "high" : "medium"
          }
        )
      );
    });

  command
    .command("thoughts-plan")
    .description("Plan a per-note thought write without executing it.")
    .requiredOption("--book-id <id>", "Goodreads book id.")
    .requiredOption("--annotation-pair-id <id>", "Annotation pair id from a private local parse.")
    .option("--json", "Emit JSON.", true)
    .action((options: { bookId: string; annotationPairId: string }) => {
      printJson(
        envelope({
          dryRun: true,
          mutatesAccount: true,
          method: "POST",
          route: `/notes/${options.bookId}/${options.annotationPairId}/note`,
          routeTemplate: "/notes/{book_id}/{annotation_pair_id}/note",
          form: {
            authenticity_token: "<from-current-page>",
            note: "<user-supplied-thought>"
          },
          warning: "Execution is disabled until an approved capture proves payload, CSRF requirements, and reload verification."
        })
      );
    });

  return command;
}
