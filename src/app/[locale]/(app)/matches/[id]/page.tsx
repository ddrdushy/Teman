import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { getLocale, getTranslations, getFormatter } from 'next-intl/server';
import { db } from '@/db';
import { match, request, person, session } from '@/db/schema';
import { personIdFromSession } from '@/auth';
import { revealLocation, matchedPerson } from '@/lib/privacy';
import { Sisi } from '@/components/Sisi';
import { Card } from '@/components/Card';
import { Avatar } from '@/components/Avatar';
import { Banner } from '@/components/Banner';
import { CancelMatch } from './CancelMatch';

/* H1/H3 · Matched ★ — both names, what happens next, and the unlocked
   details. The exact address is read ONLY through revealLocation(), which
   verifies the mutual accept and logs the reveal — for either party. */
export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const personId = await personIdFromSession();
  if (!personId) redirect(`/${locale}`);
  const t = await getTranslations('coord');
  const format = await getFormatter();

  const m = await db.query.match.findFirst({ where: eq(match.id, id) });
  if (!m) notFound();
  const r = await db.query.request.findFirst({ where: eq(request.id, m.requestId) });
  if (!r) notFound();
  const isRequester = personId === r.requesterId;
  if (!isRequester && personId !== m.temanId) notFound();

  const other = await db.query.person.findFirst({
    where: eq(person.id, isRequester ? m.temanId : r.requesterId),
  });
  if (!other) notFound();
  const otherContact = matchedPerson(other, { moments: 0, descriptors: [] });
  const firstName = otherContact.displayName.split(/\s+/)[0];

  /* the reveal — mutual-accept-gated and audited inside revealLocation() */
  const location = await revealLocation(r.id, personId);
  const sess = await db.query.session.findFirst({ where: eq(session.matchId, m.id) });

  return (
    <main className="screen-pad" style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 'var(--s-4)' }}>
        <Sisi state={r.status === 'active' ? 'together' : 'answered'} size={88} />
      </div>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5em', textAlign: 'center', margin: 0 }}>
        {t('matchedTitle', { name: firstName })}
      </h1>

      <Card accent="connection">
        <div style={{ display: 'flex', gap: '0.7em', alignItems: 'center', marginBottom: '0.5em' }}>
          <Avatar name={otherContact.displayName} />
          <b>{otherContact.displayName}</b>
        </div>
        {[
          [t('whenLabel'), format.dateTime(r.startsAt, { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' })],
          [t('whereLabel'), r.title],
          [t('addressLabel'), location.address ?? t('noAddress')],
          [t('phoneLabel'), otherContact.phone],
        ].map(([label, value], i) => (
          <div key={i} style={{ display: 'flex', gap: '0.8em', padding: '0.25em 0', alignItems: 'baseline' }}>
            <span style={{ color: 'var(--n-700)', flex: '0 0 6.5em', fontSize: '0.85em' }}>{label}</span>
            <span style={{ minWidth: 0 }}>{value}</span>
          </div>
        ))}
      </Card>

      <Banner variant="info">{t('remindersNote')}</Banner>

      <Link href={`/${locale}/messages/${r.id}`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
        {t('messageCta', { name: firstName })}
      </Link>
      {sess && r.status !== 'completed' && (
        <Link href={`/${locale}/sessions/${sess.id}`} className="btn btn-ghost btn-lg" style={{ textDecoration: 'none' }}>
          {t('sessionCta')}
        </Link>
      )}
      <CancelMatch matchId={m.id} />
    </main>
  );
}
