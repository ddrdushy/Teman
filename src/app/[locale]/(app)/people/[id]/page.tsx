import { and, count, eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { person, area, feedback, match, session } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { publicPerson } from '@/lib/privacy';
import { readUrl } from '@/lib/storage';
import { Avatar } from '@/components/Avatar';
import { Pill } from '@/components/Pill';
import { Card } from '@/components/Card';
import { careRecipient } from '@/db/schema';
import { AddToTrusted } from './AddToTrusted';

/* J4 · Someone's profile — verification, Moments count, tenure, descriptor
   words, languages, area. Facts and words; no rating exists to show. */
export default async function PersonProfilePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const viewerId = await personIdFromSession();
  if (!viewerId) redirect(`/${locale}`);
  const t = await getTranslations('people');

  const p = await db.query.person.findFirst({ where: eq(person.id, id) });
  if (!p) notFound();

  const [moments] = await db.select({ n: count() }).from(session)
    .innerJoin(match, eq(session.matchId, match.id))
    .where(and(eq(match.temanId, id), eq(session.state, 'ended')));

  const rows = await db.query.feedback.findMany({
    where: eq(feedback.aboutPerson, id),
    columns: { descriptors: true },
  });
  const tally = new Map<string, number>();
  for (const row of rows) for (const d of row.descriptors ?? []) {
    tally.set(d, (tally.get(d) ?? 0) + 1);
  }
  const descriptors = [...tally.entries()].sort((a, b) => b[1] - a[1]).map(([d]) => d);

  const trust = publicPerson(p, { moments: moments.n, descriptors });
  const a = trust.areaId ? await db.query.area.findFirst({ where: eq(area.id, trust.areaId) }) : null;
  const areaName =
    (locale === 'ms' ? a?.nameMs : locale === 'ta' ? a?.nameTa : locale === 'zh' ? a?.nameZh : a?.name) ??
    a?.name ?? '';
  const photoUrl = trust.photoKey ? await readUrl(trust.photoKey) : undefined;
  const verified = ['identity', 'community', 'enhanced'].includes(trust.verificationTier);
  const memberSince = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(trust.memberSince);

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <div style={{ display: 'flex', gap: 'var(--s-3)', alignItems: 'center' }}>
        <Avatar name={trust.displayName} photoUrl={photoUrl} size="lg" />
        <div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.4em', margin: 0 }}>{trust.displayName}</h1>
          {verified && <p style={{ margin: '0.3em 0 0' }}><Pill variant="completed">{t('verified')}</Pill></p>}
        </div>
      </div>
      <Card>
        {[
          [t('moments'), t('momentsValue', { count: trust.temanMoments })],
          [t('memberSince'), memberSince],
          [t('area'), areaName],
        ].map(([label, value], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '1em', padding: '0.25em 0' }}>
            <span style={{ color: 'var(--n-700)', fontSize: '0.9em' }}>{label}</span>
            <b style={{ textAlign: 'end' }}>{value}</b>
          </div>
        ))}
      </Card>
      {trust.bio && <p style={{ margin: 0 }}>{trust.bio}</p>}
      {descriptors.length > 0 && (
        <div>
          <p className="label" style={{ color: 'var(--n-700)', margin: '0 0 0.5em' }}>{t('saidAbout')}</p>
          <div className="chips">
            {descriptors.map((d) => (
              <span key={d} className="chip" aria-disabled="true" style={{ cursor: 'default' }}>
                {t(`descriptor.${d}` as never)}
              </span>
            ))}
          </div>
        </div>
      )}
      {viewerId !== id && (
        <AddToTrusted
          temanId={id}
          recipients={(await db.query.careRecipient.findMany({
            where: eq(careRecipient.managedBy, viewerId),
            columns: { id: true, preferredName: true },
          })).map((r) => ({ id: r.id, name: r.preferredName }))}
        />
      )}
    </main>
  );
}
