import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { organisation, circle, area } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { Pill } from '@/components/Pill';
import { ListRow } from '@/components/ListRow';

/* K10 · Organisation profile — verified badge, its circles. Individual
   members always choose whether to connect. */
export default async function OrgPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  if (!(await personIdFromSession())) redirect(`/${locale}`);
  const t = await getTranslations('community');

  const org = await db.query.organisation.findFirst({ where: eq(organisation.id, id) });
  if (!org) notFound();
  const a = org.areaId ? await db.query.area.findFirst({ where: eq(area.id, org.areaId) }) : null;
  const circles = await db.query.circle.findMany({
    where: eq(circle.organisationId, id),
  });

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{org.name}</h1>
      <p style={{ color: 'var(--n-700)', margin: 0 }}>{a?.name ?? ''}</p>
      {org.verifiedAt && <p style={{ margin: 0 }}><Pill variant="completed">{t('orgVerified')}</Pill></p>}
      {circles.filter((c) => c.status === 'active').length > 0 && (
        <section style={{ display: 'grid', gap: 'var(--s-2)' }}>
          <h2 className="label" style={{ color: 'var(--n-700)', margin: 0 }}>{t('orgCircles')}</h2>
          <div className="stack">
            {circles.filter((c) => c.status === 'active').map((c) => (
              <ListRow key={c.id} href={`/${locale}/circles/${c.id}`} icon={c.name.charAt(0)} title={c.name} />
            ))}
          </div>
        </section>
      )}
      <p className="field-hint" style={{ margin: 0 }}>{t('neverAutoMatched')}</p>
    </main>
  );
}
