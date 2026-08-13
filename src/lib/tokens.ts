import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/* Platform surfaces (web manifest, theme-color meta) cannot reference CSS
   variables, so they read the literals out of tokens.css — the hex still
   lives in exactly one file. */
let cache: Record<string, string> | null = null;

export function token(name: string): string {
  if (!cache) {
    const css = readFileSync(join(process.cwd(), 'src/app/tokens.css'), 'utf8');
    cache = {};
    for (const m of css.matchAll(/--([\w-]+):\s*(#[0-9A-Fa-f]{6})/g)) cache[m[1]] = m[2];
  }
  const v = cache[name];
  if (!v) throw new Error(`token --${name} not found in tokens.css`);
  return v;
}
