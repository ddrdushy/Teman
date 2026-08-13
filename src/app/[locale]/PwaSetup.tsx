'use client';

import { useEffect } from 'react';

/* Registers the service worker in production. Registration failure is
   silent and harmless — the app works identically without it. */
export function PwaSetup() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);
  return null;
}
