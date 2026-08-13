import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/i18n';

/* Locale always in the path (/en, /ms, /ta, /zh). The language picker is the
   first screen, so there is no browser-language guessing to be clever about. */
export default createMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: 'always',
});

export const config = {
  // Everything except API routes, Next internals, and files with an extension.
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
