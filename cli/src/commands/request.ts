import { Command } from "commander";
import { buildLiveRequestPlan, executeLiveRequest } from "../client/live.js";
import { envelope, loadApiMapRoutes, printJson, type GoodreadsRoute } from "../lib.js";
import { emitLiveMutationWarning, riskLevelForRoute } from "../risk.js";

function parsePairs(values: string[] | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const value of values ?? []) {
    const index = value.indexOf("=");
    if (index <= 0) throw new Error(`expected name=value, got ${value}`);
    out[value.slice(0, index)] = value.slice(index + 1);
  }
  return out;
}

function parseJson(value: string | undefined): unknown {
  if (value === undefined) return undefined;
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`--body-json must be valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function findRoute(selector: string): Promise<GoodreadsRoute> {
  const routes = await loadApiMapRoutes();
  const route = routes.find(
    (candidate) => candidate.id === selector || candidate.path === selector || `${candidate.method} ${candidate.path}` === selector
  );
  if (!route) throw new Error(`unknown Goodreads route: ${selector}`);
  return route;
}

export function requestCommand(): Command {
  const command = new Command("request").description("Plan or execute live Goodreads web requests.");

  command
    .command("plan")
    .description("Build a request plan without sending it.")
    .requiredOption("--route <id-or-path>", "Route id, path, or 'METHOD /path' selector from api-map routes.")
    .option("--param <name=value...>", "Path parameter.", (value, previous: string[] = []) => [...previous, value], [])
    .option("--query <name=value...>", "Query parameter.", (value, previous: string[] = []) => [...previous, value], [])
    .option("--body-json <json>", "JSON body preview.")
    .option("--form <name=value...>", "Form body field preview.", (value, previous: string[] = []) => [...previous, value], [])
    .option("--base-url <url>", "Base URL.", "https://www.goodreads.com")
    .action(async (options: { route: string; param: string[]; query: string[]; bodyJson?: string; form: string[]; baseUrl: string }) => {
      const route = await findRoute(options.route);
      const plan = buildLiveRequestPlan(route, {
        baseUrl: options.baseUrl,
        pathParams: parsePairs(options.param),
        query: parsePairs(options.query),
        bodyJson: parseJson(options.bodyJson),
        form: parsePairs(options.form),
        dryRun: true
      });
      printJson(envelope({ ...plan, riskLevel: riskLevelForRoute(route) }));
    });

  command
    .command("execute")
    .description("Execute a live Goodreads request. Mutating routes write to the live account unless --dry-run is supplied.")
    .requiredOption("--route <id-or-path>", "Route id, path, or 'METHOD /path' selector from api-map routes.")
    .option("--param <name=value...>", "Path parameter.", (value, previous: string[] = []) => [...previous, value], [])
    .option("--query <name=value...>", "Query parameter.", (value, previous: string[] = []) => [...previous, value], [])
    .option("--body-json <json>", "JSON request body.")
    .option("--form <name=value...>", "Form body field.", (value, previous: string[] = []) => [...previous, value], [])
    .option("--base-url <url>", "Base URL.", "https://www.goodreads.com")
    .option("--dry-run", "Preview the live request without sending it.", false)
    .action(
      async (options: {
        route: string;
        param: string[];
        query: string[];
        bodyJson?: string;
        form: string[];
        baseUrl: string;
        dryRun: boolean;
      }) => {
        const route = await findRoute(options.route);
        const executeOptions = {
          baseUrl: options.baseUrl,
          pathParams: parsePairs(options.param),
          query: parsePairs(options.query),
          bodyJson: parseJson(options.bodyJson),
          form: parsePairs(options.form),
          dryRun: options.dryRun
        };
        if (options.dryRun) {
          printJson(envelope({ ...buildLiveRequestPlan(route, executeOptions), riskLevel: riskLevelForRoute(route) }));
          return;
        }
        emitLiveMutationWarning(route);
        printJson(envelope(await executeLiveRequest(route, executeOptions)));
      }
    );

  return command;
}
