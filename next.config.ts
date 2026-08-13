import { readFileSync } from 'node:fs';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/* Platform surfaces (manifest, theme-color) can't use CSS variables, so the
   two colours they need are inlined from tokens.css at build time — the hex
   still lives in exactly one file, and nothing reads the filesystem at
   runtime (which serverless would break). */
const tokensCss = readFileSync('./src/app/tokens.css', 'utf8');
const cssToken = (name: string) => {
  const m = tokensCss.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`));
  if (!m) throw new Error(`token --${name} not found in tokens.css`);
  return m[1];
};

const nextConfig: NextConfig = {
  // Standalone output for the Docker/VPS path; Vercel does its own thing.
  ...(process.env.VERCEL ? {} : { output: 'standalone' as const }),
  // Without this Next walks up and roots the trace at $HOME, which breaks
  // the standalone copy step (and the Docker build with it).
  outputFileTracingRoot: process.cwd(),
  // Lets a verification build run beside `pnpm dev` / the Playwright
  // webServer without the two fighting over .next.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  env: {
    TEMAN_TOKEN_T900: cssToken('t-900'),
    TEMAN_TOKEN_N050: cssToken('n-050'),
  },
};

export default withNextIntl(nextConfig);
