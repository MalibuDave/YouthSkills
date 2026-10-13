// Runs the wireframe on the fictional demo ward (DEC-016), separate from data/accounts.sqlite.
//   npm run demo          start the demo (creates the demo data the first time)
//   npm run demo:reset    rebuild the demo data, then start
import { existsSync } from "node:fs";
import { join } from "node:path";
import { seedDemo, DEMO_PASSWORD, DEMO_WARD } from "./seed-demo.mjs";
import { createAppServer } from "../server.mjs";

const dbPath = process.env.CY_DEMO_DB || join(process.cwd(), "data", "demo.sqlite");
const reset = process.argv.includes("--reset");
if (reset || !existsSync(dbPath)) {
  const { summary, lessons } = seedDemo(dbPath);
  console.log(`Demo data ${reset ? "rebuilt" : "created"}: ${summary.map(row => `${row.n} ${row.role} ${row.status}`).join(", ")}; ${lessons} lesson completions.`);
}
if (process.argv.includes("--seed-only")) process.exit(0);
const port = Number(process.env.PORT || 4173);
createAppServer({ dbPath }).listen(port, "127.0.0.1", () => {
  console.log(`\nCovenant Youth demo (${DEMO_WARD}) at http://127.0.0.1:${port}`);
  console.log(`Sign in as bishop@example.test (also counselor1, counselor2, clerk) or any youth, e.g. ava.<last name>@example.test`);
  console.log(`Password for every demo account: ${DEMO_PASSWORD}`);
  console.log(`To start over: npm run demo:reset`);
});
