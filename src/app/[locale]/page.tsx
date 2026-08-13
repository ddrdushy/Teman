import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Sisi } from '@/components/Sisi';
import { locales, localeNames, type Locale } from '@/i18n';

/* Placeholder for A2 · Welcome (docs/07, §A). Three short lines, one CTA.
   The language switch here stands in for LanguageSheet until the primitives
   land — locale names are data, never translated (A-01). */
export default async function WelcomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('welcome');

  return (
    <main style={{ maxWidth: '40ch', margin: '0 auto', padding: 'var(--s-6) var(--s-5)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--s-8) 0 var(--s-6)' }}>
        <Sisi state="waiting" size={118} />
      </div>

      <h1
        style={{
          fontFamily: 'var(--serif)',
          fontSize: '1.9em',
          lineHeight: 1.25,
          textAlign: 'center',
        }}
      >
        {t('title')}
      </h1>
      <p style={{ marginTop: 'var(--s-4)', textAlign: 'center', color: 'var(--n-700)' }}>
        {t('line1')}
      </p>

      <nav
        aria-label={t('languagesLabel')}
        style={{ marginTop: 'var(--s-10)', display: 'grid', gap: 'var(--tap-gap)' }}
      >
        {locales.map((l: Locale) => (
          <Link
            key={l}
            href={`/${l}`}
            lang={l}
            aria-current={l === locale ? 'true' : undefined}
            style={{
              minHeight: 'var(--tap-primary)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '0 var(--s-4)',
              border: l === locale ? '2.5px solid var(--t-900)' : '1.5px solid var(--n-500)',
              background: l === locale ? 'var(--t-050)' : 'var(--n-050)',
              borderRadius: 'var(--r-btn)',
              textDecoration: 'none',
              color: 'var(--n-900)',
            }}
          >
            <span style={{ fontSize: '21px', fontWeight: 600 }}>{localeNames[l].own}</span>
            <span style={{ fontSize: '14px', color: 'var(--n-700)' }}>{localeNames[l].en}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
