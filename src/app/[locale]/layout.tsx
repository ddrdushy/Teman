import type { CSSProperties, ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales, type Locale } from '@/i18n';
import { resolveTextScale } from '@/lib/preferences';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Teman',
};

/* The whole app renders per-account (text scale, session), so routes are
   dynamic. Static prerendering returns for the public site in G20, which gets
   its own segment. */
export const dynamic = 'force-dynamic';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  const [messages, textScale] = await Promise.all([getMessages(), resolveTextScale()]);

  return (
    /* tokens.css keys per-script typography off this lang attribute, and the
       account's 18/22/26 choice overrides --fs-body for every descendant. */
    <html lang={locale} style={{ '--fs-body': `${textScale}px` } as CSSProperties}>
      <head>
        {/* Self-host these before the pilot — a 3G Android should not wait on
            Google Fonts. Family names must match the stacks in tokens.css. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&family=Vollkorn:wght@500;600;700&family=Noto+Sans+Tamil:wght@400;600;700&family=Noto+Serif+Tamil:wght@600;700&family=Noto+Sans+SC:wght@400;600;700&family=Noto+Serif+SC:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
