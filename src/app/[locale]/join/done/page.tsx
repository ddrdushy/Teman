import Link from 'next/link';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getTranslations, getLocale } from 'next-intl/server';
import { db } from '@/db';
import { area } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { personForJoin } from '@/lib/join';
import { SisiReveal } from '@/components/SisiReveal';

/* A7 · You're in ★ — the Peak–End moment of onboarding. Sisi completes: the
   dashed form fills amber for the first time in this person's experience of
   the product. Then the intent fork. Not a generic checkmark. */
export default async function JoinDonePage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}/join/phone`);
  const p = await personForJoin(personId);
  if (!p?.displayName) redirect(`/${locale}/join/name`);
  if (!p.areaId) redirect(`/${locale}/join/area`);

  const a = await db.query.area.findFirst({ where: eq(area.id, p.areaId) });
  const areaName =
    (locale === 'ms' ? a?.nameMs : locale === 'ta' ? a?.nameTa : locale === 'zh' ? a?.nameZh : a?.name) ??
    a?.name ?? '';

  const t = await getTranslations('join');

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-5)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--s-8) 0 0' }}>
        <SisiReveal size={118} />
      </div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.7em', lineHeight: 1.25, textAlign: 'center', margin: 0 }}>
        {t('doneTitle', { area: areaName })}
      </h1>
      <p style={{ color: 'var(--n-700)', textAlign: 'center', margin: 0 }}>{t('intentPrompt')}</p>
      <div className="stack" style={{ marginTop: 'var(--s-4)' }}>
        <Link href={`/${locale}/verify`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
          {t('intentHelp')}
        </Link>
        <Link href={`/${locale}/home`} className="btn btn-ghost btn-lg" style={{ textDecoration: 'none' }}>
          {t('intentNeed')}
        </Link>
      </div>
    </main>
  );
}
