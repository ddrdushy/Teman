// drizzle-kit wraps custom column types in double quotes, which turns
// geography(Point, 4326) into a (nonexistent) quoted identifier. Run after
// every `drizzle-kit generate` — wired into the db:generate script.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'src/db/migrations';
for (const f of readdirSync(dir).filter((f) => f.endsWith('.sql'))) {
  const p = join(dir, f);
  const src = readFileSync(p, 'utf8');
  const out = src.replaceAll('"geography(Point, 4326)"', 'geography(Point, 4326)');
  if (out !== src) {
    writeFileSync(p, out);
    console.log(`unquoted geography types in ${f}`);
  }
}
