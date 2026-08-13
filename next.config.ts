import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  // Standalone output so the Docker image ships node_modules-free.
  output: 'standalone',
  // Without this Next walks up and roots the trace at $HOME, which breaks
  // the standalone copy step (and the Docker build with it).
  outputFileTracingRoot: process.cwd(),
};

export default withNextIntl(nextConfig);
