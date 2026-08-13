import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { Banner } from '@/components/Banner';

/* D2 · Explain first, ask second: what it's for, who sees it, when it's
   deleted. The highest-drop-off flow starts by earning trust. */
export default async function VerifyWhyPage() {
  const locale = await getLocale();
  const t = await getTranslations('verify');

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('whyTitle')}</h1>
      <p style={{ margin: 0 }}>{t('whyFor')}</p>
      <p style={{ margin: 0 }}>{t('whyWhoSees')}</p>
      <Banner variant="info">{t('whyRetention')}</Banner>
      <Link href={`/${locale}/verify/id`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
        {t('whyCta')}
      </Link>
      <Link href={`/${locale}/verify`} className="btn btn-ghost" style={{ textDecoration: 'none' }}>
        {t('backToLadder')}
      </Link>
    </main>
  );
}
