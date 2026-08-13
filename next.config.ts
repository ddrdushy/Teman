import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  // Standalone output so the Docker image ships node_modules-free.
  output: 'standalone',
};

export default withNextIntl(nextConfig);
