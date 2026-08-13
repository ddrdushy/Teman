import type { CSSProperties, ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales, type Locale } from '@/i18n';
import { resolveTextScale } from '@/lib/preferences';
import { PwaSetup } from './PwaSetup';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Teman',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Teman', statusBarStyle: 'default' },
  icons: { apple: '/icons/apple-touch-icon.png' },
};

export function generateViewport() {
  return { themeColor: process.env.TEMAN_TOKEN_T900 };
}

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
      {/* Fonts are self-hosted via fonts.css — nothing external loads. */}
      <body>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
        <PwaSetup />
      </body>
    </html>
  );
}
