import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const here = dirname(fileURLToPath(import.meta.url));
const cliRoot = join(here, "..");
const repoRoot = join(cliRoot, "..");
const openApiPath = join(repoRoot, "api-map", "openapi", "undocumented", "goodreads-web.yaml");
const outputDir = join(repoRoot, "api-map", "markdown", "endpoints");

function routeId(method, path) {
  const slug = path
    .replace(/^\//, "")
    .replace(/\{([^}]+)\}/g, "$1")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `${method.toLowerCase()}-${slug || "home"}`;
}

function isMutation(method, path, summary) {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) return true;
  if (path === "/message/mark_all_as_read") return true;
  return Boolean(summary?.toLowerCase().includes("account mutation"));
}

function parameterLines(operation) {
  const parameters = (operation.parameters ?? []).filter((parameter) => "name" in parameter);
  if (parameters.length === 0) return "- none";
  return parameters
    .map((parameter) => `- ${parameter.name} (${parameter.in ?? "unknown"}${parameter.required ? ", required" : ""})`)
    .join("\n");
}

const doc = YAML.parse(await readFile(openApiPath, "utf8"));
await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const [path, methods] of Object.entries(doc.paths ?? {})) {
  for (const [methodName, operation] of Object.entries(methods)) {
    if (methodName === "parameters") continue;
    const method = methodName.toUpperCase();
    const mutation = isMutation(method, path, operation.summary ?? "");
    const file = join(outputDir, `${routeId(method, path)}.md`);
    const content = `# ${method} ${path}

Mutation: ${mutation ? "yes" : "no"}
Risk: ${mutation ? (method === "DELETE" ? "write-destructive" : "write-mutate") : "read"}

Summary: ${operation.summary ?? "n/a"}

Tags: ${(operation.tags ?? []).join(", ") || "n/a"}

Parameters:
${parameterLines(operation)}

Source: api-map/openapi/undocumented/goodreads-web.yaml
`;
    await writeFile(file, content);
  }
}
