import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const projectRoot = new URL("../", import.meta.url);
const excludedDirectories = new Set([
  ".git",
  ".next",
  ".cache",
  "build",
  "coverage",
  "dist",
  "node_modules",
]);
const historicalAllowlist = new Set([
  "docs/2026-07-13-executive-handoff.md",
  "docs/executive-handoff-2026-07-14.md",
  "docs/executive-handoff-2026-07-18.md",
  "docs/notarix-working-tree-inventory-2026-08-05.md",
  "docs/progress-report-2026-07-14.md",
]);
const selfAllowlist = new Set([
  "docs/notarix-auth-containment-route-matrix.md",
  "scripts/check-auth-provider-references.mjs",
  "tests/source-contract.test.mjs",
]);
const forbidden = [
  /signin-with-chatgpt/i,
  /signout-with-chatgpt/i,
  /ChatGPTUser/,
  /getChatGPTUser/,
  /requireChatGPTUser/,
  /oai-authenticated-[a-z0-9-]*/i,
  /\.openai\/hosting\.json/i,
  /Sites-managed authentication/i,
];

const files = await walk(".");
const offenders = [];
for (const file of files) {
  if (selfAllowlist.has(file)) continue;
  const content = await readFile(new URL(file, projectRoot), "utf8");
  if (historicalAllowlist.has(file)) {
    if (!content.includes("Superseded legacy architecture") &&
        !content.includes("Superseding disposition")) {
      offenders.push(`${file}: missing superseded-history marker`);
    }
    continue;
  }
  for (const pattern of forbidden) {
    if (pattern.test(content)) offenders.push(`${file}: ${pattern.source}`);
  }
}

if (offenders.length) {
  console.error("Unauthorized authentication-provider references detected:");
  for (const offender of offenders) console.error(`- ${offender}`);
  process.exit(1);
}

console.log("auth_provider_reference_control=passed");

async function walk(directory, files = []) {
  const entries = await readdir(new URL(directory, projectRoot), { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
    const relative = join(directory, entry.name).replace(/^\.\//, "");
    if (entry.isDirectory()) await walk(relative, files);
    else if (/\.(?:ts|tsx|mjs|js|json|md)$/.test(entry.name) && entry.name !== "package-lock.json") {
      files.push(relative);
    }
  }
  return files;
}
