import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Sisi } from '@/components/Sisi';
import { WelcomeLangSwitch } from './WelcomeLangSwitch';

/* A2 · What Teman is, in three short lines, one CTA. The language switch
   stays top-right — this screen is still reachable in the wrong language. */
export default async function WelcomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('welcome');

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-5)' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <WelcomeLangSwitch />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--s-6) 0 0' }}>
        <Sisi state="waiting" size={96} />
      </div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.7em', lineHeight: 1.25, textAlign: 'center', margin: 0 }}>
        {t('title')}
      </h1>
      <p style={{ color: 'var(--n-700)', textAlign: 'center', margin: 0 }}>{t('line1')}</p>
      <p style={{ color: 'var(--n-700)', textAlign: 'center', margin: 0 }}>{t('line2')}</p>
      <p style={{ color: 'var(--n-700)', textAlign: 'center', margin: 0 }}>{t('line3')}</p>
      <Link href={`/${locale}/join/phone`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
        {t('cta')}
      </Link>
    </main>
  );
}
