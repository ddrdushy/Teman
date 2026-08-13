import type { MetadataRoute } from 'next';
import { token } from '@/lib/tokens';

/* Served at /manifest.webmanifest (the Caddyfile already no-caches it).
   Colours come from tokens.css via the token() reader — never literals. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Teman',
    short_name: 'Teman',
    description: 'No one should have to go alone.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: token('n-050'),
    theme_color: token('t-900'),
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
