import { and, eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { availability, person, area, category } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { AvailabilityForm, type SlotInitial } from '../../AvailabilityForm';

/* F4 · Edit a slot — same form, pre-filled. */
export default async function AvailabilityEditPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('avail');

  const slot = await db.query.availability.findFirst({
    where: and(eq(availability.id, id), eq(availability.personId, personId)),
  });
  if (!slot) notFound();

  const p = await db.query.person.findFirst({ where: eq(person.id, personId) });
  const a = p?.areaId ? await db.query.area.findFirst({ where: eq(area.id, p.areaId) }) : null;
  const areaName =
    (locale === 'ms' ? a?.nameMs : locale === 'ta' ? a?.nameTa : locale === 'zh' ? a?.nameZh : a?.name) ??
    a?.name ?? '';
  const cats = await db.select().from(category).where(eq(category.active, true)).orderBy(category.sort);

  const pad = (n: number) => String(n).padStart(2, '0');
  const initial: SlotInitial = {
    id: slot.id,
    date: `${slot.startsAt.getFullYear()}-${pad(slot.startsAt.getMonth() + 1)}-${pad(slot.startsAt.getDate())}`,
    from: `${pad(slot.startsAt.getHours())}:${pad(slot.startsAt.getMinutes())}`,
    until: `${pad(slot.endsAt.getHours())}:${pad(slot.endsAt.getMinutes())}`,
    radius: slot.radiusM <= 1000 ? 'walking' : slot.radiusM <= 5000 ? 'area' : 'city',
    categories: slot.categories ?? [],
    transport: (slot.transport as string[] | null) ?? [],
    repeatsWeekly: slot.repeatsWeekly,
  };

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{t('editTitle')}</h1>
      <AvailabilityForm
        initial={initial}
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
