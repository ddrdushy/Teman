import { eq, inArray } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { circle, circleMember, person, area, organisation } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { Pill } from '@/components/Pill';
import { ListRow } from '@/components/ListRow';
import { JoinCircle } from './JoinCircle';

/* K7/K8 · Circle detail with members. Joining follows the circle's policy;
   membership never auto-matches anyone. */
export default async function CircleDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('community');

  const c = await db.query.circle.findFirst({ where: eq(circle.id, id) });
  if (!c || c.status !== 'active') notFound();
  const a = c.areaId ? await db.query.area.findFirst({ where: eq(area.id, c.areaId) }) : null;
  const org = c.organisationId
    ? await db.query.organisation.findFirst({ where: eq(organisation.id, c.organisationId) })
    : null;

  const members = await db.query.circleMember.findMany({ where: eq(circleMember.circleId, id) });
  const people = members.length
    ? await db.query.person.findMany({
        where: inArray(person.id, members.map((m) => m.personId)),
        columns: { id: true, displayName: true },
      })
    : [];
  const nameOf = new Map(people.map((p) => [p.id, p.displayName]));
  const mine = members.find((m) => m.personId === personId);

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', margin: 0 }}>{c.name}</h1>
      <p style={{ color: 'var(--n-700)', margin: 0 }}>
        {a?.name ?? ''}{org ? ` · ${org.name}` : ''}
      </p>
      {org?.verifiedAt && <p style={{ margin: 0 }}><Pill variant="completed">{t('orgVerified')}</Pill></p>}
      <JoinCircle circleId={id} membership={mine?.state ?? null} />
      <section style={{ display: 'grid', gap: 'var(--s-2)' }}>
        <h2 className="label" style={{ color: 'var(--n-700)', margin: 0 }}>
          {t('memberCount', { count: members.filter((m) => m.state === 'member').length })}
        </h2>
        <div className="stack">
          {members.filter((m) => m.state === 'member').slice(0, 30).map((m) => (
            <ListRow key={m.personId} href={`/${locale}/people/${m.personId}`}
              icon={(nameOf.get(m.personId) ?? '·').charAt(0)}
              title={nameOf.get(m.personId) ?? ''}
              sub={m.role === 'coordinator' ? t('coordinator') : undefined} />
          ))}
        </div>
      </section>
      <p className="field-hint" style={{ margin: 0 }}>{t('neverAutoMatched')}</p>
    </main>
  );
}
