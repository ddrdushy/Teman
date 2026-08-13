import type { MetadataRoute } from 'next';

/* Served at /manifest.webmanifest (the Caddyfile already no-caches it).
   Colours are inlined from tokens.css at build time via next.config env —
   no runtime filesystem reads, no hex outside tokens.css. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Teman',
    short_name: 'Teman',
    description: 'No one should have to go alone.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: process.env.TEMAN_TOKEN_N050!,
    theme_color: process.env.TEMAN_TOKEN_T900!,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
