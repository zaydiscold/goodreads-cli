import { parseShelfRss } from "../cli/src/parsers/rss.js";

const sample = `<rss><channel><title>demo</title><item><title>Book</title><book_id>1</book_id></item></channel></rss>`;
console.log(parseShelfRss(sample));
