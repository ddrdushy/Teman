import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { person, area, category } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { AvailabilityForm } from '../AvailabilityForm';

/* F1 · Declare free time. */
export default async function AvailabilityNewPage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('avail');

  const p = await db.query.person.findFirst({ where: eq(person.id, personId) });
  if (!p?.areaId) redirect(`/${locale}/join/next`);
  const a = await db.query.area.findFirst({ where: eq(area.id, p.areaId) });
  const areaName =
    (locale === 'ms' ? a?.nameMs : locale === 'ta' ? a?.nameTa : locale === 'zh' ? a?.nameZh : a?.name) ??
    a?.name ?? '';
  const cats = await db.select().from(category).where(eq(category.active, true)).orderBy(category.sort);

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('newTitle')}</h1>
      <AvailabilityForm
        areaName={areaName}
        cats={cats.map((c) => ({
          id: c.id,
          name:
            (locale === 'ms' ? c.nameMs : locale === 'ta' ? c.nameTa : locale === 'zh' ? c.nameZh : c.nameEn) ??
            c.nameEn,
        }))}
      />
    </main>
  );
}
