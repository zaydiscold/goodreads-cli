import { Command } from "commander";
import { envelope, loadApiMapRoutes, loadBrowserRoutes, printJson, searchApiRoutes, summarizeBrowserRoutes } from "../lib.js";

export function apiMapCommand(): Command {
  const command = new Command("api-map").description("Inspect the bundled Goodreads API map.");

  command
    .command("routes")
    .description("List mapped routes from api-map/openapi/undocumented/goodreads-web.yaml.")
    .option("--json", "Emit JSON.", true)
    .action(async () => {
      const routes = await loadApiMapRoutes();
      printJson(envelope({ routeCount: routes.length, routes }));
    });

  command
    .command("search")
    .description("Search mapped Goodreads routes by natural-language capability.")
    .argument("<query>", "Search query, for example 'publicize notes' or 'friend requests'.")
    .option("--limit <n>", "Max routes to return.", (value) => Number.parseInt(value, 10), 20)
    .option("--json", "Emit JSON.", true)
    .action(async (query: string, options: { limit: number }) => {
      const routes = searchApiRoutes(await loadApiMapRoutes(), query, options.limit);
      printJson(envelope({ query, routeCount: routes.length, routes }, { confidence: routes.length > 0 ? "high" : "low" }));
    });

  command
    .command("browser-routes")
    .description("List sanitized authenticated Chrome CDP route templates captured from Goodreads.")
    .option("--summary", "Emit only a grouped summary.", false)
    .option("--json", "Emit JSON.", true)
    .action(async (options: { summary: boolean }) => {
      const routes = await loadBrowserRoutes();
      printJson(envelope(options.summary ? summarizeBrowserRoutes(routes) : { routeCount: routes.length, routes }));
    });

  return command;
}
