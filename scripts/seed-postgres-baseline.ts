import fs from "node:fs";
import { reconcileBaselinePostgresSeed } from "../app/postgres-seed";

loadLocalEnv();

try {
  const result = await reconcileBaselinePostgresSeed();
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.available ? 0 : 1);
} catch (error) {
  console.error(error);
  process.exit(1);
}

function loadLocalEnv() {
  if (!fs.existsSync(".env.local")) return;

  for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const match = line.match(
      /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/,
    );
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
}
