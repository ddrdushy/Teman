import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { db } from '@/db';
import { person, careRecipient, category } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { ai } from '@/lib/ai';
import { RequestWizard } from './RequestWizard';

/* E1–E11 · Seven steps, one decision per screen, autosaved to the device so
   a caregiver interrupted on a commute loses nothing. */
export default async function RequestNewPage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);

  const p = await db.query.person.findFirst({ where: eq(person.id, personId) });
  if (!p?.areaId) redirect(`/${locale}/join/next`);

  const recipients = await db.query.careRecipient.findMany({
    where: eq(careRecipient.managedBy, personId),
    columns: { id: true, preferredName: true, relationship: true, accessibility: true },
  });
  const cats = await db.select().from(category).where(eq(category.active, true)).orderBy(category.sort);

  return (
    <RequestWizard
      recipients={recipients.map((r) => ({
        id: r.id,
        name: r.preferredName,
        relationship: r.relationship,
        accessibility: (r.accessibility as string[] | null) ?? [],
      }))}
      categories={cats.map((c) => ({
        id: c.id,
        group: c.group,
        key: c.key,
        name:
          (locale === 'ms' ? c.nameMs : locale === 'ta' ? c.nameTa : locale === 'zh' ? c.nameZh : c.nameEn) ??
          c.nameEn,
      }))}
      defaultAreaId={p.areaId}
      aiAvailable={ai.available()}
    />
  );
}
