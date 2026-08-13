import { count, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { db } from '@/db';
import { person, area, availability } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { CaregiverHome } from './CaregiverHome';
import { ElderHome } from './ElderHome';

/* B1 / B2 · Home. Elder view is a different screen, not a shrunken B1 —
   features are hidden, not made smaller. Pre-launch phase (M1) shows honest
   status content; the three-action home switches on when requests open (M2,
   REQUESTS_OPEN=true). */
export default async function HomePage() {
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);

  const p = await db.query.person.findFirst({ where: eq(person.id, personId) });
  if (!p) redirect(`/${locale}`);
  if (!p.displayName || !p.areaId) redirect(`/${locale}/join/next`);

  const a = await db.query.area.findFirst({ where: eq(area.id, p.areaId) });
  const areaName =
    (locale === 'ms' ? a?.nameMs : locale === 'ta' ? a?.nameTa : locale === 'zh' ? a?.nameZh : a?.name) ??
    a?.name ?? '';

  const [volunteerRow] = await db.select({ n: count() }).from(person).where(eq(person.areaId, p.areaId));
  const [slotRow] = await db.select({ n: count() }).from(availability)
    .where(eq(availability.personId, personId));

  const requestsOpen = process.env.REQUESTS_OPEN === 'true';

  if (p.isElderView) {
    return <ElderHome name={p.displayName} />;
  }
  return (
    <CaregiverHome
      name={p.displayName}
      areaName={areaName}
      verificationTier={p.verificationTier}
      volunteersInArea={volunteerRow.n}
      availabilityCount={slotRow.n}
      hasPhoto={Boolean(p.photoKey)}
      hasLanguages={Boolean(p.languages?.length)}
      requestsOpen={requestsOpen}
      launchMonth={process.env.LAUNCH_MONTH ?? '2026-09'}
    />
  );
}
