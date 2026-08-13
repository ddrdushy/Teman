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
      {/* sticky only on wide screens — four wrapped rows must not pin
          themselves over a phone viewport */}
      <header className="site-header">
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--s-3) var(--s-5)' }}>
          {/* row 1: identity left; the two actions a returning person needs right */}
          <div className="site-bar">
            <Link href={`/${locale}`} aria-label={t('nav.homeAria')} style={{ display: 'flex' }}>
              <TemanLogo height={28} />
            </Link>
            <div style={{ display: 'flex', gap: 'var(--tap-gap)', alignItems: 'center' }}>
              <Link href={`/${locale}/join/phone`} className="btn btn-primary"
                style={{ width: 'auto', minHeight: 'var(--tap-min)', textDecoration: 'none', fontSize: '0.9em' }}>
                {t('nav.signIn')}
              </Link>
              <PublicLangSwitch />
            </div>
          </div>
          {/* row 2: the reading nav, wrapping tidily on small screens */}
          <nav className="site-links">
            {nav.map(([path, label]) => (
              <Link key={path} href={`/${locale}/${path}`}>{label}</Link>
            ))}
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
