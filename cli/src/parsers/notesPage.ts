import * as cheerio from "cheerio";
import { cleanText } from "../lib.js";
import type { NotesPageParse } from "../types/index.js";

export function parseNotesPage(html: string): NotesPageParse {
  const $ = cheerio.load(html);
  const notes: NotesPageParse["notes"] = [];
  const visibleCounts = new Map<string, number>();

  $(".js-readingNote, [data-note-persist-endpoint], [data-annotation-pair-id]").each((_, element) => {
    const node = $(element);
    const visible = node.attr("data-visible") ?? null;
    visibleCounts.set(String(visible), (visibleCounts.get(String(visible)) ?? 0) + 1);
    notes.push({
      annotationPairId: node.attr("data-annotation-pair-id") ?? null,
      visible,
      notePersistEndpoint: node.attr("data-note-persist-endpoint") ?? null,
      hasSpoilerToggle: node.find("input[type='checkbox'], .js-spoiler").length > 0
    });
  });

  const noteBookLinks: NotesPageParse["noteBookLinks"] = [];
  $("a[href*='/notes/']").each((_, element) => {
    const href = $(element).attr("href");
    if (!href) return;
    const label = cleanText($(element).text());
    if (!label) return;
    noteBookLinks.push({
      href,
      labelLength: label.length
    });
  });

  return {
    kind: "notes_page",
    title: cleanText($("title").first().text()) || null,
    noteCount: notes.length,
    visibleCounts: Object.fromEntries(visibleCounts.entries()),
    notes,
    noteBookLinks
  };
}
