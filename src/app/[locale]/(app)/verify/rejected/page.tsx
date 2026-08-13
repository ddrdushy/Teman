import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { verification } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { Banner } from '@/components/Banner';

/* D6 · Not accepted — a reason, a retry, and a human route. Never a dead end. */
export default async function VerifyRejectedPage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('verify');

  const latest = await db.query.verification.findFirst({
    where: eq(verification.personId, personId),
    orderBy: desc(verification.createdAt),
  });
  if (latest?.state !== 'rejected') redirect(`/${locale}/verify`);

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('rejectedTitle')}</h1>
      <Banner variant="error" title={t('rejectedWhy')}>
        {latest.rejectReason ?? t('rejectedNoReason')}
      </Banner>
      <p style={{ margin: 0 }}>{t('rejectedNext')}</p>
      <Link href={`/${locale}/verify/why`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
        {t('tryAgainCta')}
      </Link>
      <p className="field-hint" style={{ margin: 0 }}>{t('rejectedHuman')}</p>
    </main>
  );
}
