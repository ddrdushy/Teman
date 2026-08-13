import type { ReactNode } from 'react';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { TemanLogo } from '@/components/Sisi';
import { PublicLangSwitch } from './PublicLangSwitch';

/* The public site shell (docs/08 part 2): same brand system as the app,
   more room to breathe. One goal per page; the header never competes. */
export default async function PublicLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const t = await getTranslations('site');

  const nav = [
    ['how-it-works', t('nav.how')],
    ['volunteer', t('nav.volunteer')],
    ['families', t('nav.families')],
    ['safety', t('nav.safety')],
  ] as const;

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 40, background: 'var(--n-050)',
        borderBottom: '1px solid var(--n-200)',
      }}>
        <div style={{
          maxWidth: '1000px', margin: '0 auto', padding: 'var(--s-3) var(--s-5)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--s-4)', flexWrap: 'wrap',
        }}>
          <Link href={`/${locale}`} aria-label={t('nav.homeAria')} style={{ display: 'flex' }}>
            <TemanLogo height={28} />
          </Link>
          <nav style={{ display: 'flex', gap: 'var(--s-4)', alignItems: 'center', flexWrap: 'wrap' }}>
            {nav.map(([path, label]) => (
              <Link key={path} href={`/${locale}/${path}`}
                style={{ color: 'var(--n-800)', textDecoration: 'none', fontWeight: 600, padding: '0.6em 0', fontSize: '0.9em' }}>
                {label}
              </Link>
            ))}
            <PublicLangSwitch />
          </nav>
        </div>
      </header>

      <div style={{ flex: 1 }}>{children}</div>

      <footer style={{ background: 'var(--n-900)', color: 'var(--n-100)', padding: 'var(--s-8) var(--s-5)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gap: 'var(--s-4)' }}>
          <TemanLogo height={28} onDark />
          <p style={{ fontFamily: 'var(--serif)', fontSize: '1.1em', margin: 0, color: 'var(--white)' }}>
            {t('tagline')}
          </p>
          <nav style={{ display: 'flex', gap: 'var(--s-4)', flexWrap: 'wrap', fontSize: '0.85em' }}>
            {[
              ['need-a-teman', t('nav.need')],
              ['organisations', t('nav.orgs')],
              ['about', t('nav.about')],
              ['faq', t('nav.faq')],
              ['privacy', t('nav.privacy')],
              ['terms', t('nav.terms')],
              ['contact', t('nav.contact')],
            ].map(([path, label]) => (
              <Link key={path} href={`/${locale}/${path}`} style={{ color: 'var(--n-200)', textDecoration: 'none', padding: '0.5em 0' }}>
                {label}
              </Link>
            ))}
          </nav>
          <p style={{ margin: 0, fontSize: '0.8em', color: 'var(--n-300)' }}>{t('emergencyFooter')}</p>
        </div>
      </footer>
    </div>
  );
}
