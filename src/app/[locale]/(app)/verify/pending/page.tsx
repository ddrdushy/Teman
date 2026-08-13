import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { Card } from '@/components/Card';
import { Pill } from '@/components/Pill';

/* D5 · Under review. States who reviews and roughly how long — expectations,
   not a spinner. */
export default async function VerifyPendingPage() {
  const locale = await getLocale();
  const t = await getTranslations('verify');

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('pendingTitle')}</h1>
      <Card>
        <p style={{ margin: '0 0 0.4em' }}><Pill variant="looking">{t('pendingPill')}</Pill></p>
        <p style={{ margin: 0 }}>{t('pendingWho')}</p>
        <p className="card-meta" style={{ margin: '0.4em 0 0' }}>{t('pendingHowLong')}</p>
      </Card>
      <Link href={`/${locale}/home`} className="btn btn-ghost btn-lg" style={{ textDecoration: 'none' }}>
        {t('backHome')}
      </Link>
    </main>
  );
}
